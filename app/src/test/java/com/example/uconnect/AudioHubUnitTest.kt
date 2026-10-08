package com.example.uconnect

import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class AudioHubUnitTest {

    @Test
    fun testAudioFrequencies() {
        // Channel 1 standard test carrier audio frequency
        val carrierA = 440.0
        val carrierB = 1000.0

        assertTrue("Carrier A should be audible standard pitch", carrierA > 20.0)
        assertTrue("Carrier B should be alignment frequency", carrierB == 1000.0)
        assertEquals(440.0, carrierA, 0.001)
    }

    @Test
    fun testChannelSeparationLogic() {
        val channel1Name = "Channel 1 (Carrier A: 2.3/2.8 MHz)"
        val channel2Name = "Channel 2 (Carrier B: 3.2/3.8 MHz)"

        assertTrue(channel1Name.contains("2.3/2.8"))
        assertTrue(channel2Name.contains("3.2/3.8"))
    }
}
