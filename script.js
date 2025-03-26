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
        return { seekTime, avgSeekTime: seekTime / sequence.length, sequence };
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
        const remaining = [...this.requests].sort((a, b) => a - b);
        const rightTracks = remaining.filter(track => track >= this.headPosition);
        const leftTracks = remaining.filter(track => track < this.headPosition).reverse();
        return this.calculateSeekTime([...rightTracks, 199, ...leftTracks]);
    }

    cscan() {
        const remaining = [...this.requests].sort((a, b) => a - b);
        const rightTracks = remaining.filter(track => track >= this.headPosition);
        const leftTracks = remaining.filter(track => track < this.headPosition);
        return this.calculateSeekTime([...rightTracks, 199, 0, ...leftTracks]);
    }

    look() {
        const remaining = [...this.requests].sort((a, b) => a - b);
        const rightTracks = remaining.filter(track => track >= this.headPosition);
        const leftTracks = remaining.filter(track => track < this.headPosition).reverse();
        return this.calculateSeekTime([...rightTracks, ...leftTracks]);
    }

    clook() {
        const remaining = [...this.requests].sort((a, b) => a - b);
        const rightTracks = remaining.filter(track => track >= this.headPosition);
        const leftTracks = remaining.filter(track => track < this.headPosition);
        return this.calculateSeekTime([...rightTracks, ...leftTracks]);
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
        const results = {};
        let bestAlgorithm = algorithms[0];
        let minSeekTime = Infinity;

        for (const alg of algorithms) {
            results[alg] = this.runAlgorithm(alg);
            if (results[alg].seekTime < minSeekTime) {
                minSeekTime = results[alg].seekTime;
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
        const gradientFill = this.ctx.createLinearGradient(0, 0, 0, 400);
        gradientFill.addColorStop(0, 'rgba(59, 130, 246, 0.2)');
        gradientFill.addColorStop(1, 'rgba(59, 130, 246, 0)');

        const config = {
            type: 'line',
            data: {
                labels: sequence.map((_, i) => i),
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
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: { duration: 1000, easing: 'easeInOutQuart' },
                scales: {
                    y: {
                        title: { display: true, text: 'Track Number', color: '#9ca3af' },
                        min: 0,
                        max: 200,
                        grid: { color: 'rgba(75, 85, 99, 0.2)' },
                        ticks: { color: '#9ca3af' }
                    },
                    x: {
                        title: { display: true, text: 'Request Sequence', color: '#9ca3af' },
                        grid: { color: 'rgba(75, 85, 99, 0.2)' },
                        ticks: { color: '#9ca3af' }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: '#9ca3af',
                            font: { family: "'Inter', sans-serif", size: 12 }
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(17, 24, 39, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        padding: 12,
                        cornerRadius: 8,
                        callbacks: {
                            label: context => `Track: ${context.parsed.y}`
                        }
                    }
                }
            }
        };

        if (this.chart) this.chart.destroy();
        this.chart = new Chart(this.ctx, config);
    }

    updateComparisonTable(results) {
        const tableBody = document.getElementById('comparisonTableBody');
        tableBody.innerHTML = '';
        Object.entries(results)
            .sort((a, b) => a[1].seekTime - b[1].seekTime)
            .forEach(([algorithm, data], index) => {
                const isLowest = index === 0;
                const row = document.createElement('tr');
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
        const animate = (element, end) => {
            const start = 0;
            const duration = 1000;
            const startTime = performance.now();
            const update = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                element.textContent = Math.round(start + (end - start) * progress);
                if (progress < 1) requestAnimationFrame(update);
            };
            requestAnimationFrame(update);
        };

        animate(document.getElementById('seekTime'), results.seekTime);
        animate(document.getElementById('avgSeekTime'), results.avgSeekTime);
        const aiRecommendationEl = document.getElementById('aiRecommendation');
        aiRecommendationEl.textContent = algorithm.toUpperCase();
        aiRecommendationEl.classList.add('highlight');
        setTimeout(() => aiRecommendationEl.classList.remove('highlight'), 1000);
    }
}

const scheduler = new DiskScheduler();
const visualizer = new DiskVisualizer('diskChart');
const getInputValues = () => ({
    headPosition: parseInt(document.getElementById('headPosition').value),
    trackRequests: document.getElementById('trackRequests').value
        .split(',')
        .map(x => parseInt(x.trim()))
        .filter(x => !isNaN(x))
});

document.getElementById('generateHead').addEventListener('click', () => 
    document.getElementById('headPosition').value = Math.floor(Math.random() * 200)
);

document.getElementById('generateTracks').addEventListener('click', () => 
    document.getElementById('trackRequests').value = Array.from(
        { length: Math.floor(Math.random() * 10) + 5 }, 
        () => Math.floor(Math.random() * 200)
    ).join(',')
);

window.visualizeAlgorithm = algorithm => {
    const { headPosition, trackRequests } = getInputValues();
    if (isNaN(headPosition) || trackRequests.length === 0) {
        alert('Please enter valid head position and track requests');
        return;
    }
    scheduler.setParameters(trackRequests, headPosition);
    const results = scheduler.runAlgorithm(algorithm);
    visualizer.visualizeSequence(results.sequence, algorithm);
    visualizer.updateResults(results, algorithm);
    document.getElementById('algorithm').value = algorithm;
};

document.getElementById('runManual').addEventListener('click', () => {
    const { headPosition, trackRequests } = getInputValues();
    const selectedAlgorithm = document.getElementById('algorithm').value;
    if (isNaN(headPosition) || trackRequests.length === 0) {
        alert('Please enter valid head position and track requests');
        return;
    }
    scheduler.setParameters(trackRequests, headPosition);
    const allResults = Object.fromEntries(
        ['fcfs', 'sstf', 'scan', 'cscan', 'look', 'clook']
            .map(alg => [alg, scheduler.runAlgorithm(alg)])
    );
    visualizer.updateComparisonTable(allResults);
    const results = scheduler.runAlgorithm(selectedAlgorithm);
    visualizer.visualizeSequence(results.sequence, selectedAlgorithm);
    visualizer.updateResults(results, selectedAlgorithm);
});

document.getElementById('runAI').addEventListener('click', () => {
    const { headPosition, trackRequests } = getInputValues();
    if (isNaN(headPosition) || trackRequests.length === 0) {
        alert('Please enter valid head position and track requests');
        return;
    }
    try {
        scheduler.setParameters(trackRequests, headPosition);
        const optimal = scheduler.findOptimalAlgorithm();
        visualizer.updateComparisonTable(optimal.allResults);
        visualizer.visualizeSequence(optimal.results.sequence, optimal.algorithm);
        visualizer.updateResults(optimal.results, optimal.algorithm);
        document.getElementById('algorithm').value = optimal.algorithm;
    } catch (error) {
        console.error('Error finding optimal algorithm:', error);
        alert('Error finding optimal algorithm. Please try again.');
    }
});
