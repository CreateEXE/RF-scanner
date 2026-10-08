package com.example.uconnect

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.uconnect.audio.AudioGenerator
import com.example.uconnect.ui.theme.UconnectAudioHubTheme

class MainActivity : ComponentActivity() {
    private val audioGenerator = AudioGenerator()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            UconnectAudioHubTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    UconnectAppScreen(
                        onPlayTone = { freq, channel -> audioGenerator.startTone(freq, channel) },
                        onStopTone = { audioGenerator.stopTone() }
                    )
                }
            }
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        audioGenerator.stopTone()
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun UconnectAppScreen(
    onPlayTone: (Double, Int) -> Unit,
    onStopTone: () -> Unit
) {
    var isPlaying by remember { mutableStateOf(false) }
    var activeChannel by remember { mutableIntStateOf(1) } // 1: Left/Ch1, 2: Right/Ch2, 0: Both
    var toneFreq by remember { mutableDoubleStateOf(440.0) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            Icons.Default.Headphones,
                            contentDescription = "Headphones",
                            tint = MaterialTheme.colorScheme.primary,
                            modifier = Modifier.padding(end = 8.dp)
                        )
                        Text(
                            text = "Uconnect® RF / IR Audio Hub",
                            fontWeight = FontWeight.Bold,
                            fontSize = 18.sp
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = MaterialTheme.colorScheme.surface
                )
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(16.dp)
                .verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // Hardware Notice Card
            Card(
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            Icons.Default.Info,
                            contentDescription = "Notice",
                            tint = MaterialTheme.colorScheme.primary,
                            modifier = Modifier.padding(end = 8.dp)
                        )
                        Text(
                            text = "How These Headphones Connect",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold
                        )
                    }
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "Your Uconnect headphones DO NOT connect via standard smartphone Bluetooth.\n\n" +
                                "• They use dual-channel Optical Infrared (IR) / 900MHz RF carrier signals.\n" +
                                "• The 1/2 switch toggles between Channel 1 (Driver/VES Screen 1) and Channel 2 (VES Screen 2).\n" +
                                "• No pairing code is required: they receive audio instantly when in line-of-sight of the transmitter dome or rear screen.\n" +
                                "• At home or with a phone: connect via a universal 2-channel IR Audio Transmitter box into your 3.5mm Aux jack.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = Color.LightGray
                    )
                }
            }

            // Quick Test Controls
            Card(
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "2-Channel Audio Diagnostic",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(12.dp))

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Button(
                            onClick = {
                                activeChannel = 1
                                toneFreq = 440.0
                                isPlaying = true
                                onPlayTone(440.0, 1)
                            },
                            modifier = Modifier.weight(1f),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = if (isPlaying && activeChannel == 1) MaterialTheme.colorScheme.primary else Color.DarkGray
                            )
                        ) {
                            Text("Channel 1 (440Hz)")
                        }

                        Button(
                            onClick = {
                                activeChannel = 2
                                toneFreq = 1000.0
                                isPlaying = true
                                onPlayTone(1000.0, 2)
                            },
                            modifier = Modifier.weight(1f),
                            colors = ButtonDefaults.buttonColors(
                                containerColor = if (isPlaying && activeChannel == 2) MaterialTheme.colorScheme.primary else Color.DarkGray
                            )
                        ) {
                            Text("Channel 2 (1kHz)")
                        }
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    if (isPlaying) {
                        Button(
                            onClick = {
                                isPlaying = false
                                onStopTone()
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = MaterialTheme.colorScheme.error),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Icon(Icons.Default.Stop, contentDescription = "Stop", modifier = Modifier.padding(end = 4.dp))
                            Text("Stop Signal Test")
                        }
                    }
                }
            }

            // Troubleshooting Checklist
            Card(
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        text = "Troubleshooting Checklist",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "1. Power LED: Ensure red power light stays solidly on.\n" +
                                "2. AAA Batteries: If sound crackles or LED dims, swap both AAA batteries.\n" +
                                "3. Volume Thumbwheel: Roll the wheel forward towards '+' to ensure it's not muted.\n" +
                                "4. Channel Switch: Match the 1/2 switch to the active screen in the vehicle.\n" +
                                "5. Line of Sight: Ensure no bag or headrest blocks the transparent red IR window on the earcups.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = Color.LightGray
                    )
                }
            }
        }
    }
}
