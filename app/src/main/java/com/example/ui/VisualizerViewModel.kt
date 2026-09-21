package com.example.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.audio.AudioAnalyzer
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

enum class FrequencyBand(val label: String, val minHz: Float, val maxHz: Float) {
    FULL("Full", 20f, 20000f),
    BASS("Bass", 20f, 250f),
    MIDS("Mids", 250f, 2000f),
    HIGHS("Highs", 2000f, 20000f)
}

class VisualizerViewModel : ViewModel() {
    private val audioAnalyzer = AudioAnalyzer(viewModelScope)
    
    private val _selectedBand = MutableStateFlow(FrequencyBand.FULL)
    val selectedBand: StateFlow<FrequencyBand> = _selectedBand.asStateFlow()

    private val sampleRate = 44100
    private val bufferSize = 2048

    val magnitudes: StateFlow<FloatArray> = combine(audioAnalyzer.magnitudes, _selectedBand) { mags, band ->
        if (mags.isEmpty()) return@combine floatArrayOf()
        val minIdx = (band.minHz * bufferSize / sampleRate).toInt().coerceIn(mags.indices)
        val maxIdx = (band.maxHz * bufferSize / sampleRate).toInt().coerceIn(mags.indices)
        mags.sliceArray(minIdx..maxIdx)
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), floatArrayOf())

    val peakFrequencyInBand: StateFlow<Float> = combine(magnitudes, _selectedBand) { mags, band ->
        if (mags.isEmpty()) return@combine 0f
        var maxMag = -1f
        var maxIdx = -1
        for (i in mags.indices) {
            if (mags[i] > maxMag) {
                maxMag = mags[i]
                maxIdx = i
            }
        }
        if (maxIdx != -1) {
            val minIdx = (band.minHz * bufferSize / sampleRate).toInt()
            (minIdx + maxIdx).toFloat() * sampleRate / bufferSize
        } else 0f
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), 0f)

    val peakFrequency: StateFlow<Float> = audioAnalyzer.peakFrequency

    private val _peaks = MutableStateFlow(FloatArray(0))
    val peaks: StateFlow<FloatArray> = _peaks.asStateFlow()

    private val _threshold = MutableStateFlow(0.8f)
    val threshold: StateFlow<Float> = _threshold.asStateFlow()

    fun setThreshold(value: Float) {
        _threshold.value = value
    }

    fun setSelectedBand(band: FrequencyBand) {
        _selectedBand.value = band
    }

    private val decayFactor = 0.98f

    init {
        viewModelScope.launch {
            magnitudes.collect { newMagnitudes ->
                if (newMagnitudes.isEmpty()) return@collect
                
                val currentPeaks = _peaks.value
                val updatedPeaks = if (currentPeaks.size != newMagnitudes.size) {
                    newMagnitudes.copyOf()
                } else {
                    FloatArray(newMagnitudes.size) { i ->
                        val decayedPeak = currentPeaks[i] * decayFactor
                        maxOf(newMagnitudes[i], decayedPeak)
                    }
                }
                _peaks.value = updatedPeaks
            }
        }
    }

    fun startAnalyzing() {
        audioAnalyzer.start()
    }

    fun stopAnalyzing() {
        audioAnalyzer.stop()
    }

    override fun onCleared() {
        super.onCleared()
        audioAnalyzer.stop()
    }
}
