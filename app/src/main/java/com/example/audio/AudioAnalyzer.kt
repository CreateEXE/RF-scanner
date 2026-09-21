package com.example.audio

import android.annotation.SuppressLint
import android.media.AudioFormat
import android.media.AudioRecord
import android.media.MediaRecorder
import android.util.Log
import com.example.util.Fft
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.launch
import kotlin.math.log10

class AudioAnalyzer(private val scope: CoroutineScope) {

    private val _magnitudes = MutableStateFlow(FloatArray(0))
    val magnitudes: StateFlow<FloatArray> = _magnitudes

    private val _peakFrequency = MutableStateFlow(0f)
    val peakFrequency: StateFlow<Float> = _peakFrequency

    private var audioRecord: AudioRecord? = null
    private var isRecording = false
    private var job: Job? = null

    private val sampleRate = 44100
    private val bufferSize = 2048 // Power of 2 for FFT

    @SuppressLint("MissingPermission")
    fun start() {
        if (isRecording) return

        val minBufferSize = AudioRecord.getMinBufferSize(
            sampleRate,
            AudioFormat.CHANNEL_IN_MONO,
            AudioFormat.ENCODING_PCM_16BIT
        )

        val actualBufferSize = bufferSize.coerceAtLeast(minBufferSize)

        audioRecord = AudioRecord(
            MediaRecorder.AudioSource.MIC,
            sampleRate,
            AudioFormat.CHANNEL_IN_MONO,
            AudioFormat.ENCODING_PCM_16BIT,
            actualBufferSize
        )

        if (audioRecord?.state != AudioRecord.STATE_INITIALIZED) {
            Log.e("AudioAnalyzer", "AudioRecord initialization failed")
            return
        }

        audioRecord?.startRecording()
        isRecording = true

        job = scope.launch(Dispatchers.IO) {
            val audioData = ShortArray(bufferSize)
            val real = FloatArray(bufferSize)
            val imag = FloatArray(bufferSize)

            while (isRecording) {
                val read = audioRecord?.read(audioData, 0, bufferSize) ?: 0
                if (read > 0) {
                    // Convert to Float and apply Hann window
                    for (i in 0 until bufferSize) {
                        val window = 0.5f * (1f - kotlin.math.cos(2f * kotlin.math.PI.toFloat() * i.toFloat() / (bufferSize - 1)))
                        real[i] = (audioData[i].toFloat() / Short.MAX_VALUE) * window
                        imag[i] = 0f
                    }

                    Fft.fft(real, imag)
                    val mags = Fft.magnitudes(real, imag)
                    
                    // Optional: Normalize or convert to dB
                    for (i in mags.indices) {
                        mags[i] = 20f * log10(mags[i].coerceAtLeast(1e-6f))
                        // Shift to a better range for visualization (e.g., 0 to 1)
                        // -60dB to 0dB range mapped to 0 to 1
                        mags[i] = ((mags[i] + 60f) / 60f).coerceIn(0f, 1f)
                    }

                    _magnitudes.value = mags

                    // Find peak frequency
                    var maxMag = -1f
                    var maxIdx = -1
                    for (i in mags.indices) {
                        if (mags[i] > maxMag) {
                            maxMag = mags[i]
                            maxIdx = i
                        }
                    }
                    if (maxIdx != -1) {
                        _peakFrequency.value = maxIdx.toFloat() * sampleRate / bufferSize
                    }
                }
                // Small delay to prevent tight loop if needed, but AudioRecord.read is blocking
            }
        }
    }

    fun stop() {
        isRecording = false
        job?.cancel()
        audioRecord?.stop()
        audioRecord?.release()
        audioRecord = null
    }
}
