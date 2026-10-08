package com.example.uconnect.audio

import android.media.AudioAttributes
import android.media.AudioFormat
import android.media.AudioTrack
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import kotlin.math.sin

/**
 * AudioGenerator produces test tones for testing Uconnect Channel 1 and Channel 2
 * output through the headphone jack, Bluetooth adapter, or IR/RF transmitter base station.
 */
class AudioGenerator {
    private var audioTrack: AudioTrack? = null
    private var playbackJob: Job? = null
    private val scope = CoroutineScope(Dispatchers.Default)

    fun startTone(frequencyHz: Double, channelMode: Int) {
        stopTone()

        playbackJob = scope.launch {
            val sampleRate = 44100
            val minBufferSize = AudioTrack.getMinBufferSize(
                sampleRate,
                AudioFormat.CHANNEL_OUT_STEREO,
                AudioFormat.ENCODING_PCM_16BIT
            )

            val track = AudioTrack.Builder()
                .setAudioAttributes(
                    AudioAttributes.Builder()
                        .setUsage(AudioAttributes.USAGE_MEDIA)
                        .setContentType(AudioAttributes.CONTENT_TYPE_MUSIC)
                        .build()
                )
                .setAudioFormat(
                    AudioFormat.Builder()
                        .setEncoding(AudioFormat.ENCODING_PCM_16BIT)
                        .setSampleRate(sampleRate)
                        .setChannelMask(AudioFormat.CHANNEL_OUT_STEREO)
                        .build()
                )
                .setBufferSizeInBytes(minBufferSize * 2)
                .setTransferMode(AudioTrack.MODE_STREAM)
                .build()

            audioTrack = track
            track.play()

            val buffer = ShortArray(minBufferSize)
            var phase = 0.0
            val phaseIncrement = (2.0 * Math.PI * frequencyHz) / sampleRate

            while (isActive) {
                for (i in 0 until minBufferSize / 2) {
                    val sample = (sin(phase) * Short.MAX_VALUE * 0.7).toInt().toShort()
                    phase += phaseIncrement
                    if (phase > 2.0 * Math.PI) {
                        phase -= 2.0 * Math.PI
                    }

                    // channelMode: 1 = Left only (Channel 1), 2 = Right only (Channel 2), 0 = Both
                    when (channelMode) {
                        1 -> {
                            buffer[i * 2] = sample      // Left (Channel 1)
                            buffer[i * 2 + 1] = 0        // Right silent
                        }
                        2 -> {
                            buffer[i * 2] = 0            // Left silent
                            buffer[i * 2 + 1] = sample  // Right (Channel 2)
                        }
                        else -> {
                            buffer[i * 2] = sample
                            buffer[i * 2 + 1] = sample
                        }
                    }
                }
                track.write(buffer, 0, minBufferSize)
            }
        }
    }

    fun stopTone() {
        playbackJob?.cancel()
        playbackJob = null
        audioTrack?.let {
            try {
                it.stop()
                it.release()
            } catch (_: Exception) {}
        }
        audioTrack = null
    }
}
