package com.example.util

import kotlin.math.PI
import kotlin.math.cos
import kotlin.math.sin

/**
 * A simple Cooley-Tukey FFT implementation.
 * Note: Input size must be a power of 2.
 */
object Fft {
    fun fft(real: FloatArray, imag: FloatArray) {
        val n = real.size
        if (n <= 1) return

        val bit = Integer.numberOfTrailingZeros(n)
        for (i in 0 until n) {
            val j = Integer.reverse(i) ushr (32 - bit)
            if (i < j) {
                val tempReal = real[i]
                real[i] = real[j]
                real[j] = tempReal
                val tempImag = imag[i]
                imag[i] = imag[j]
                imag[j] = tempImag
            }
        }

        var len = 2
        while (len <= n) {
            val ang = 2.0 * PI / len
            val wLenReal = cos(ang).toFloat()
            val wLenImag = -sin(ang).toFloat()
            var i = 0
            while (i < n) {
                var wReal = 1.0f
                var wImag = 0.0f
                for (j in 0 until len / 2) {
                    val uReal = real[i + j]
                    val uImag = imag[i + j]
                    val vReal = real[i + j + len / 2] * wReal - imag[i + j + len / 2] * wImag
                    val vImag = real[i + j + len / 2] * wImag + imag[i + j + len / 2] * wReal
                    real[i + j] = uReal + vReal
                    imag[i + j] = uImag + vImag
                    real[i + j + len / 2] = uReal - vReal
                    imag[i + j + len / 2] = uImag - vImag
                    val nextWReal = wReal * wLenReal - wImag * wLenImag
                    wImag = wReal * wLenImag + wImag * wLenReal
                    wReal = nextWReal
                }
                i += len
            }
            len *= 2
        }
    }

    /**
     * Calculates the magnitudes of the FFT result.
     * Only returns the first half (positive frequencies).
     */
    fun magnitudes(real: FloatArray, imag: FloatArray): FloatArray {
        val n = real.size / 2
        val mags = FloatArray(n)
        for (i in 0 until n) {
            mags[i] = kotlin.math.sqrt(real[i] * real[i] + imag[i] * imag[i])
        }
        return mags
    }
}
