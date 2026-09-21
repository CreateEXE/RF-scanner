@file:OptIn(ExperimentalMaterial3Api::class)

package com.example

import android.Manifest
import android.content.pm.PackageManager
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.lifecycle.viewmodel.compose.viewModel
import com.example.R
import com.example.ui.FrequencyBand
import com.example.ui.VisualizerViewModel
import com.example.ui.theme.MyApplicationTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            MyApplicationTheme {
                FrequencyVisualizerScreen()
            }
        }
    }
}

@Composable
fun FrequencyVisualizerScreen(
    viewModel: VisualizerViewModel = viewModel()
) {
    val context = LocalContext.current
    val magnitudes by viewModel.magnitudes.collectAsStateWithLifecycle()
    val peaks by viewModel.peaks.collectAsStateWithLifecycle()
    val peakFrequencyInBand by viewModel.peakFrequencyInBand.collectAsStateWithLifecycle()
    val threshold by viewModel.threshold.collectAsStateWithLifecycle()
    val selectedBand by viewModel.selectedBand.collectAsStateWithLifecycle()
    var hasPermission by remember {
        mutableStateOf(
            ContextCompat.checkSelfPermission(
                context,
                Manifest.permission.RECORD_AUDIO
            ) == PackageManager.PERMISSION_GRANTED
        )
    }

    val launcher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission(),
        onResult = { granted ->
            hasPermission = granted
            if (granted) {
                viewModel.startAnalyzing()
            }
        }
    )

    DisposableEffect(hasPermission) {
        if (hasPermission) {
            viewModel.startAnalyzing()
        }
        onDispose {
            viewModel.stopAnalyzing()
        }
    }

    Scaffold(
        modifier = Modifier.fillMaxSize(),
        topBar = {
            CenterAlignedTopAppBar(
                title = {
                    Text(
                        text = stringResource(id = R.string.app_name),
                        fontWeight = FontWeight.Bold
                    )
                }
            )
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .padding(innerPadding)
                .fillMaxSize()
                .padding(16.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(24.dp)
        ) {
            if (!hasPermission) {
                Box(
                    modifier = Modifier.weight(1f),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(
                            text = "Microphone permission is required to visualize audio frequencies.",
                            modifier = Modifier.padding(16.dp),
                            style = MaterialTheme.typography.bodyLarge,
                            textAlign = androidx.compose.ui.text.style.TextAlign.Center
                        )
                        Button(
                            onClick = { launcher.launch(Manifest.permission.RECORD_AUDIO) },
                            modifier = Modifier.testTag("request_permission_button")
                        ) {
                            Text("Grant Permission")
                        }
                    }
                }
            } else {
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .weight(1f)
                        .clip(RoundedCornerShape(16.dp)),
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)
                    )
                ) {
                    SpectrumVisualizer(
                        magnitudes = magnitudes,
                        peaks = peaks,
                        peakFrequencyHz = peakFrequencyInBand,
                        threshold = threshold,
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(16.dp)
                            .testTag("spectrum_visualizer")
                    )
                }

                VisualizerControls(
                    threshold = threshold,
                    onThresholdChange = { viewModel.setThreshold(it) },
                    selectedBand = selectedBand,
                    onBandSelect = { viewModel.setSelectedBand(it) }
                )

                FrequencyReference()
            }
        }
    }
}

@Composable
fun FrequencyReference() {
    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.secondaryContainer.copy(alpha = 0.3f)
        )
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Text(
                text = "Frequency Reference Guide",
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.Bold
            )
            val ranges = listOf(
                "20 - 250 Hz" to "Bass: Foundation and kick drums.",
                "250 - 2k Hz" to "Midrange: Vocals and most instruments.",
                "2k - 6k Hz" to "Presence: Clarity and definition.",
                "6k - 20k Hz" to "Brilliance: Air and high-end shimmer."
            )
            ranges.forEach { (range, desc) ->
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Text(
                        text = range,
                        style = MaterialTheme.typography.bodySmall,
                        fontWeight = FontWeight.SemiBold,
                        color = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.width(100.dp)
                    )
                    Text(
                        text = desc,
                        style = MaterialTheme.typography.bodySmall,
                        modifier = Modifier.weight(1f)
                    )
                }
            }
            
            HorizontalDivider(modifier = Modifier.padding(vertical = 4.dp))
            
            Text(
                text = "Signal Analysis",
                style = MaterialTheme.typography.labelLarge,
                fontWeight = FontWeight.Bold
            )
            Text(
                text = "Significant peaks in specific bands can indicate resonant frequencies or interference. In audio engineering, these can be manipulated via Equalization (EQ) to balance the sound or remove unwanted noise.",
                style = MaterialTheme.typography.bodySmall
            )
        }
    }
}

@Composable
fun SpectrumVisualizer(
    magnitudes: FloatArray,
    peaks: FloatArray,
    peakFrequencyHz: Float,
    threshold: Float,
    modifier: Modifier = Modifier
) {
    val colorPrimary = MaterialTheme.colorScheme.primary
    val colorSecondary = MaterialTheme.colorScheme.secondary
    val colorTertiary = MaterialTheme.colorScheme.tertiary
    val colorError = MaterialTheme.colorScheme.error
    val colorOnSurface = MaterialTheme.colorScheme.onSurface

    Box(modifier = modifier) {
        Canvas(modifier = Modifier.fillMaxSize()) {
            if (magnitudes.isEmpty()) return@Canvas

            val canvasWidth = size.width
            val canvasHeight = size.height
            val barCount = magnitudes.size
            val barSpacing = 2.dp.toPx()
            val barWidth = (canvasWidth - (barCount - 1) * barSpacing) / barCount

            // Draw Threshold Line
            val thresholdY = canvasHeight - (threshold * canvasHeight)
            drawLine(
                color = colorError.copy(alpha = 0.5f),
                start = Offset(0f, thresholdY),
                end = Offset(canvasWidth, thresholdY),
                strokeWidth = 1.dp.toPx()
            )

            for (i in 0 until barCount) {
                val magnitude = magnitudes[i]
                val barHeight = magnitude * canvasHeight
                
                val x = i * (barWidth + barSpacing)
                val y = canvasHeight - barHeight

                val isExceeding = magnitude >= threshold

                // Draw magnitude bar
                drawRect(
                    brush = Brush.verticalGradient(
                        colors = if (isExceeding) {
                            listOf(colorError, colorError.copy(alpha = 0.7f))
                        } else {
                            listOf(colorTertiary, colorSecondary, colorPrimary)
                        },
                        startY = y,
                        endY = canvasHeight
                    ),
                    topLeft = Offset(x, y),
                    size = androidx.compose.ui.geometry.Size(barWidth, barHeight)
                )

                // Draw peak marker
                if (peaks.size == magnitudes.size) {
                    val peakHeight = peaks[i] * canvasHeight
                    val peakY = (canvasHeight - peakHeight).coerceAtLeast(0f)
                    
                    drawRect(
                        color = if (peaks[i] >= threshold) colorError else colorOnSurface.copy(alpha = 0.6f),
                        topLeft = Offset(x, peakY),
                        size = androidx.compose.ui.geometry.Size(barWidth, 2.dp.toPx())
                    )
                }
            }
        }

        // Peak Frequency Overlay
        Surface(
            modifier = Modifier
                .align(Alignment.TopEnd)
                .padding(8.dp),
            color = MaterialTheme.colorScheme.surface.copy(alpha = 0.7f),
            shape = RoundedCornerShape(8.dp)
        ) {
            Text(
                text = "Peak: ${java.lang.String.format(java.util.Locale.US, "%.1f", peakFrequencyHz)} Hz",
                modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                style = MaterialTheme.typography.labelLarge,
                fontWeight = FontWeight.Bold,
                color = MaterialTheme.colorScheme.primary
            )
        }
    }
}

@Composable
fun VisualizerControls(
    threshold: Float,
    onThresholdChange: (Float) -> Unit,
    selectedBand: FrequencyBand,
    onBandSelect: (FrequencyBand) -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 8.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text(
                text = "Frequency Band Focus",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.SemiBold
            )
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                FrequencyBand.entries.forEach { band ->
                    FilterChip(
                        selected = selectedBand == band,
                        onClick = { onBandSelect(band) },
                        label = { Text(band.label) },
                        modifier = Modifier.testTag("band_chip_${band.name.lowercase()}")
                    )
                }
            }
        }

        Column {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Signal Threshold",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.SemiBold
                )
                Text(
                    text = "${(threshold * 60 - 60).toInt()} dB",
                    style = MaterialTheme.typography.labelLarge,
                    color = MaterialTheme.colorScheme.primary
                )
            }
            Slider(
                value = threshold,
                onValueChange = onThresholdChange,
                modifier = Modifier.testTag("threshold_slider")
            )
        }
    }
}
