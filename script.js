class DiskScheduler {
    constructor() {
        this.requests = [];
        this.headPosition = 0;
    }

    setParameters(requests, headPosition) {
        this.requests = [...requests];
        this.headPosition = headPosition;
    }

    calculateSeekTime(sequence) {
        let seekTime = 0;
        let currentPosition = this.headPosition;

        for (const track of sequence) {
            seekTime += Math.abs(currentPosition - track);
            currentPosition = track;
        }

        return {
            seekTime,
            avgSeekTime: seekTime / sequence.length,
            sequence
        };
    }

    fcfs() {
        return this.calculateSeekTime([...this.requests]);
    }

    sstf() {
        const sequence = [];
        const remaining = [...this.requests];
        let currentPosition = this.headPosition;

        while (remaining.length > 0) {
            const closest = remaining.reduce((prev, curr) => 
                Math.abs(curr - currentPosition) < Math.abs(prev - currentPosition) ? curr : prev
            );
            sequence.push(closest);
            currentPosition = closest;
            remaining.splice(remaining.indexOf(closest), 1);
        }

        return this.calculateSeekTime(sequence);
    }

    scan() {
        const sequence = [];
        const remaining = [...this.requests];
        remaining.sort((a, b) => a - b);

        const maxTrack = 199;
        let currentPosition = this.headPosition;
        let direction = 1; // 1 for right, -1 for left

        // Add tracks to the right
        const rightTracks = remaining.filter(track => track >= currentPosition);
        sequence.push(...rightTracks);
        sequence.push(maxTrack);

        // Add tracks to the left
        const leftTracks = remaining.filter(track => track < currentPosition).reverse();
        sequence.push(...leftTracks);

        return this.calculateSeekTime(sequence);
    }

    cscan() {
        const sequence = [];
        const remaining = [...this.requests];
        remaining.sort((a, b) => a - b);

        const maxTrack = 199;
        let currentPosition = this.headPosition;

        // Add tracks to the right
        const rightTracks = remaining.filter(track => track >= currentPosition);
        sequence.push(...rightTracks);
        sequence.push(maxTrack);

        // Jump to beginning and add remaining tracks
        const leftTracks = remaining.filter(track => track < currentPosition);
        sequence.push(0);
        sequence.push(...leftTracks);

        return this.calculateSeekTime(sequence);
    }

    look() {
        const sequence = [];
        const remaining = [...this.requests];
        remaining.sort((a, b) => a - b);

        let currentPosition = this.headPosition;

        // Add tracks to the right
        const rightTracks = remaining.filter(track => track >= currentPosition);
        sequence.push(...rightTracks);

        // Add tracks to the left
        const leftTracks = remaining.filter(track => track < currentPosition).reverse();
        sequence.push(...leftTracks);

        return this.calculateSeekTime(sequence);
    }

    clook() {
        const sequence = [];
        const remaining = [...this.requests];
        remaining.sort((a, b) => a - b);

        let currentPosition = this.headPosition;

        // Add tracks to the right
        const rightTracks = remaining.filter(track => track >= currentPosition);
        sequence.push(...rightTracks);

        // Add tracks to the left
        const leftTracks = remaining.filter(track => track < currentPosition);
        sequence.push(...leftTracks);

        return this.calculateSeekTime(sequence);
    }

    runAlgorithm(algorithm) {
        switch(algorithm.toLowerCase()) {
            case 'fcfs': return this.fcfs();
            case 'sstf': return this.sstf();
            case 'scan': return this.scan();
            case 'cscan': return this.cscan();
            case 'look': return this.look();
            case 'clook': return this.clook();
            default: throw new Error('Invalid algorithm');
        }
    }

    findOptimalAlgorithm() {
        const algorithms = ['fcfs', 'sstf', 'scan', 'cscan', 'look', 'clook'];
        let bestAlgorithm = null;
        let minSeekTime = Infinity;
        const results = {};

        for (const alg of algorithms) {
            const result = this.runAlgorithm(alg);
            results[alg] = result;
            
            if (result.seekTime < minSeekTime) {
                minSeekTime = result.seekTime;
                bestAlgorithm = alg;
            }
        }

        return {
            algorithm: bestAlgorithm,
            results: results[bestAlgorithm],
            allResults: results
        };
    }
}

class DiskVisualizer {
    constructor(canvasId) {
        this.ctx = document.getElementById(canvasId).getContext('2d');
        this.chart = null;
    }

    visualizeSequence(sequence, algorithmName) {
        const labels = sequence.map((_, index) => index);
        const gradientFill = this.ctx.createLinearGradient(0, 0, 0, 400);
        gradientFill.addColorStop(0, 'rgba(59, 130, 246, 0.2)');
        gradientFill.addColorStop(1, 'rgba(59, 130, 246, 0)');

        const data = {
            labels: labels,
            datasets: [{
                label: `${algorithmName.toUpperCase()} Disk Movement`,
                data: sequence,
                borderColor: '#3b82f6',
                backgroundColor: gradientFill,
                tension: 0.4,
                fill: true,
                pointRadius: 6,
                pointHoverRadius: 8,
                pointBackgroundColor: '#3b82f6',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: '#3b82f6',
                borderWidth: 3
            }]
        };

        const config = {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: 1000,
                    easing: 'easeInOutQuart'
                },
                scales: {
                    y: {
                        title: {
                            display: true,
                            text: 'Track Number',
                            color: '#9ca3af'
                        },
                        min: 0,
                        max: 200,
                        grid: {
                            color: 'rgba(75, 85, 99, 0.2)',
                            borderColor: 'rgba(75, 85, 99, 0.2)'
                        },
                        ticks: {
                            color: '#9ca3af'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Request Sequence',
                            color: '#9ca3af'
                        },
                        grid: {
                            color: 'rgba(75, 85, 99, 0.2)',
                            borderColor: 'rgba(75, 85, 99, 0.2)'
                        },
                        ticks: {
                            color: '#9ca3af'
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: '#9ca3af',
                            font: {
                                family: "'Inter', sans-serif",
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(17, 24, 39, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        titleFont: {
                            family: "'Inter', sans-serif",
                            size: 14
                        },
                        bodyFont: {
                            family: "'Inter', sans-serif",
                            size: 13
                        },
                        padding: 12,
                        cornerRadius: 8,
                        callbacks: {
                            label: function(context) {
                                return `Track: ${context.parsed.y}`;
                            }
                        }
                    }
                }
            }
        };

        if (this.chart) {
            this.chart.destroy();
        }
        this.chart = new Chart(this.ctx, config);
    }

    updateComparisonTable(results) {
        const tableBody = document.getElementById('comparisonTableBody');
        tableBody.innerHTML = '';

        // Sort algorithms by seek time
        const sortedResults = Object.entries(results).sort((a, b) => a[1].seekTime - b[1].seekTime);

        sortedResults.forEach(([algorithm, data], index) => {
            const row = document.createElement('tr');
            const isLowest = index === 0;
            
            row.innerHTML = `
                <td class="py-2 px-4 ${isLowest ? 'text-green-400 font-semibold' : ''}">${algorithm.toUpperCase()}</td>
                <td class="py-2 px-4 text-right ${isLowest ? 'text-green-400 font-semibold' : ''}">${data.seekTime}</td>
                <td class="py-2 px-4 text-right ${isLowest ? 'text-green-400 font-semibold' : ''}">${data.avgSeekTime.toFixed(2)}</td>
                <td class="py-2 px-4 text-right ${isLowest ? 'text-green-400 font-semibold' : ''}">
                    <button onclick="visualizeAlgorithm('${algorithm}')" 
                        class="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-all duration-200">
                        View
                    </button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    updateResults(results, algorithm) {
        const animateValue = (element, start, end, duration) => {
            const range = end - start;
            const startTime = performance.now();
            
            const animate = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                const value = start + (range * progress);
                element.textContent = Math.round(value);
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                }
            };
            
            requestAnimationFrame(animate);
        };

        // Animate seek times
        const seekTimeEl = document.getElementById('seekTime');
        const avgSeekTimeEl = document.getElementById('avgSeekTime');
        const aiRecommendationEl = document.getElementById('aiRecommendation');
        
        animateValue(seekTimeEl, 0, results.seekTime, 1000);
        animateValue(avgSeekTimeEl, 0, results.avgSeekTime, 1000);
        
        // Update algorithm name
        aiRecommendationEl.textContent = algorithm.toUpperCase();
        aiRecommendationEl.classList.add('highlight');
        
        setTimeout(() => {
            aiRecommendationEl.classList.remove('highlight');
        }, 1000);
    }
}

// Initialize components
const scheduler = new DiskScheduler();
const visualizer = new DiskVisualizer('diskChart');

// Helper function to parse input
function getInputValues() {
    const headPosition = parseInt(document.getElementById('headPosition').value);
    const trackRequests = document.getElementById('trackRequests').value
        .split(',')
        .map(x => parseInt(x.trim()))
        .filter(x => !isNaN(x));
    
    return { headPosition, trackRequests };
}

// Generate random head position
document.getElementById('generateHead').addEventListener('click', () => {
    const headPosition = Math.floor(Math.random() * 200);
    document.getElementById('headPosition').value = headPosition;
});

// Generate random track requests
document.getElementById('generateTracks').addEventListener('click', () => {
    const numRequests = Math.floor(Math.random() * 10) + 5; // 5-15 requests
    const tracks = Array.from({ length: numRequests }, () => Math.floor(Math.random() * 200));
    document.getElementById('trackRequests').value = tracks.join(',');
});

// Run all algorithms and compare
async function runAllAlgorithms(headPosition, trackRequests) {
    scheduler.setParameters(trackRequests, headPosition);
    const algorithms = ['fcfs', 'sstf', 'scan', 'cscan', 'look', 'clook'];
    const results = {};

    for (const alg of algorithms) {
        results[alg] = scheduler.runAlgorithm(alg);
    }

    return results;
}

// Function to visualize specific algorithm
window.visualizeAlgorithm = function(algorithm) {
    const { headPosition, trackRequests } = getInputValues();
    if (isNaN(headPosition) || trackRequests.length === 0) {
        alert('Please enter valid head position and track requests');
        return;
    }

    scheduler.setParameters(trackRequests, headPosition);
    const results = scheduler.runAlgorithm(algorithm);
    
    visualizer.visualizeSequence(results.sequence, algorithm);
    visualizer.updateResults(results, algorithm);
    
    // Update algorithm select to match visualization
    document.getElementById('algorithm').value = algorithm;
};

// Run selected algorithm
document.getElementById('runManual').addEventListener('click', async () => {
    const { headPosition, trackRequests } = getInputValues();
    const selectedAlgorithm = document.getElementById('algorithm').value;

    if (isNaN(headPosition) || trackRequests.length === 0) {
        alert('Please enter valid head position and track requests');
        return;
    }

    // Run all algorithms for comparison
    const allResults = await runAllAlgorithms(headPosition, trackRequests);
    visualizer.updateComparisonTable(allResults);

    // Show selected algorithm visualization
    scheduler.setParameters(trackRequests, headPosition);
    const results = scheduler.runAlgorithm(selectedAlgorithm);
    
    visualizer.visualizeSequence(results.sequence, selectedAlgorithm);
    visualizer.updateResults(results, selectedAlgorithm);
});

// Let AI choose optimal algorithm
document.getElementById('runAI').addEventListener('click', async () => {
    const { headPosition, trackRequests } = getInputValues();

    if (isNaN(headPosition) || trackRequests.length === 0) {
        alert('Please enter valid head position and track requests');
        return;
    }

    try {
        scheduler.setParameters(trackRequests, headPosition);
        const optimal = scheduler.findOptimalAlgorithm();
        
        // Update comparison table with all results
        visualizer.updateComparisonTable(optimal.allResults);
        
        // Show optimal algorithm visualization
        visualizer.visualizeSequence(optimal.results.sequence, optimal.algorithm);
        visualizer.updateResults(optimal.results, optimal.algorithm);
        
        // Update algorithm select to show optimal choice
        document.getElementById('algorithm').value = optimal.algorithm;
    } catch (error) {
        console.error('Error finding optimal algorithm:', error);
        alert('Error finding optimal algorithm. Please try again.');
    }
});
