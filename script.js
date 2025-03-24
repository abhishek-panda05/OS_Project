let algorithmChart = null;

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('randomTracks').onclick = () => {
        const tracks = Array.from({ length: Math.floor(Math.random() * 5) + 5 }, 
            () => Math.floor(Math.random() * 200));
        document.getElementById('tracks').value = tracks.join(',');
    };

    document.getElementById('randomHead').onclick = () => {
        document.getElementById('head').value = Math.floor(Math.random() * 200);
    };

    document.getElementById('schedulerForm').onsubmit = (e) => {
        e.preventDefault();
        const tracks = document.getElementById('tracks').value.split(',').map(t => parseInt(t.trim()));
        const head = parseInt(document.getElementById('head').value);
        let algorithm = document.getElementById('algorithm').value;

        if (!tracks.length || isNaN(head)) {
            alert('Please fill in all fields');
            return;
        }

        const algorithms = {
            'fcfs': fcfs,
            'sstf': sstf,
            'scan': scan,
            'cscan': cscan,
            'look': look,
            'clook': clook
        };

        const algorithmNames = {
            'ml': 'ML-based Solution (Best Algorithm)',
            'fcfs': 'First Come First Serve (FCFS)',
            'sstf': 'Shortest Seek Time First (SSTF)',
            'scan': 'SCAN (Elevator)',
            'cscan': 'C-SCAN (Circular SCAN)',
            'look': 'LOOK',
            'clook': 'C-LOOK (Circular LOOK)'
        };

        let result;
        let selectedAlgorithm = algorithm;

        // Clear previous results
        const resultsDiv = document.getElementById('algorithm-results');
        resultsDiv.innerHTML = '';

        if (algorithm === 'ml') {
            // Calculate results for all algorithms
            const allResults = {};
            for (const [algoName, algoFunc] of Object.entries(algorithms)) {
                const tempResult = algoFunc(tracks, head);
                allResults[algoName] = {
                    seekTime: tempResult.totalSeekTime,
                    sequence: tempResult.sequence
                };
            }

            // Find the best algorithm (minimum seek time)
            const bestAlgo = Object.entries(allResults)
                .reduce((a, b) => a[1].seekTime < b[1].seekTime ? a : b)[0];
            
            selectedAlgorithm = bestAlgo;
            result = {
                sequence: allResults[bestAlgo].sequence,
                totalSeekTime: allResults[bestAlgo].seekTime
            };

            // Show comparison table
            const comparisonDiv = document.createElement('div');
            comparisonDiv.className = 'algorithm-comparison';
            comparisonDiv.innerHTML = `
                <h4>
                    Algorithm Performance Comparison
                    <span class="best-algorithm-badge">Best: ${algorithmNames[bestAlgo]}</span>
                </h4>
            `;
            
            const table = document.createElement('table');
            table.className = 'comparison-table';
            table.innerHTML = `
                <tr>
                    <th>Algorithm</th>
                    <th>Total Movement</th>
                    <th>Efficiency</th>
                    <th>Performance</th>
                </tr>
            `;
            
            const sortedResults = Object.entries(allResults)
                .sort((a, b) => {
                    // Always put the best algorithm first
                    if (a[0] === bestAlgo) return -1;
                    if (b[0] === bestAlgo) return 1;
                    // Then sort the rest by seek time
                    return a[1].seekTime - b[1].seekTime;
                });
            
            const bestSeekTime = allResults[bestAlgo].seekTime;
            sortedResults.forEach(([algo, data]) => {
                const efficiency = ((bestSeekTime / data.seekTime) * 100).toFixed(1);
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>
                        <div class="algorithm-name">
                            ${algorithmNames[algo]}
                            ${algo === bestAlgo ? '<span class="best-algorithm-badge">Best Choice</span>' : ''}
                        </div>
                    </td>
                    <td>${data.seekTime} tracks</td>
                    <td>${efficiency}%</td>
                    <td>
                        <div class="efficiency-bar">
                            <div class="efficiency-bar-fill" style="width: ${efficiency}%"></div>
                        </div>
                    </td>
                `;
                if (algo === bestAlgo) {
                    row.classList.add('selected-algorithm');
                }
                table.appendChild(row);
            });
            
            comparisonDiv.appendChild(table);
            resultsDiv.appendChild(comparisonDiv);
        } else {
            result = algorithms[algorithm](tracks, head);
        }

        updateChart(result, `${algorithmNames[selectedAlgorithm]}${algorithm === 'ml' ? ' (Best)' : ''}`);
        
        const resultInfo = document.createElement('div');
        resultInfo.className = 'results-info';
        resultInfo.innerHTML = `
            <h3>${algorithmNames[selectedAlgorithm]}${algorithm === 'ml' ? ' (Best Algorithm)' : ''}</h3>
            <p>Total Seek Time: ${result.totalSeekTime}</p>
            <p>Sequence: ${result.sequence.join(' → ')}</p>
        `;
        resultsDiv.insertBefore(resultInfo, resultsDiv.firstChild);
    };
});

function createChart(ctx, type, data, options) {
    return new Chart(ctx, { type, data, options });
}

function calculateSeekTime(sequence) {
    return sequence.slice(1).reduce((acc, curr, i) => acc + Math.abs(curr - sequence[i]), 0);
}

function fcfs(tracks, head) {
    const sequence = [head, ...tracks];
    return { sequence, totalSeekTime: calculateSeekTime(sequence) };
}

function sstf(tracks, head) {
    let currentHead = head;
    let remainingTracks = [...tracks];
    const sequence = [head];

    while (remainingTracks.length > 0) {
        let closestTrack = remainingTracks.reduce((closest, track) => 
            Math.abs(track - currentHead) < Math.abs(closest - currentHead) ? track : closest
        , remainingTracks[0]);

        sequence.push(closestTrack);
        currentHead = closestTrack;
        remainingTracks = remainingTracks.filter(track => track !== closestTrack);
    }

    return { sequence, totalSeekTime: calculateSeekTime(sequence) };
}

function scan(tracks, head, maxTrack = 199) {
    const sortedTracks = [...tracks, head].sort((a, b) => a - b);
    const index = sortedTracks.indexOf(head);
    const sequence = [...sortedTracks.slice(index), maxTrack, ...sortedTracks.slice(0, index).reverse()];
    return { sequence, totalSeekTime: calculateSeekTime(sequence) };
}

function cscan(tracks, head, maxTrack = 199) {
    const sortedTracks = [...tracks, head].sort((a, b) => a - b);
    const index = sortedTracks.indexOf(head);
    const sequence = [...sortedTracks.slice(index), maxTrack, 0, ...sortedTracks.slice(0, index)];
    return { sequence, totalSeekTime: calculateSeekTime(sequence) };
}

function look(tracks, head) {
    const sortedTracks = [...tracks, head].sort((a, b) => a - b);
    const index = sortedTracks.indexOf(head);
    const sequence = [...sortedTracks.slice(index), ...sortedTracks.slice(0, index).reverse()];
    return { sequence, totalSeekTime: calculateSeekTime(sequence) };
}

function clook(tracks, head) {
    const sortedTracks = [...tracks, head].sort((a, b) => a - b);
    const index = sortedTracks.indexOf(head);
    const sequence = [...sortedTracks.slice(index), ...sortedTracks.slice(0, index)];
    return { sequence, totalSeekTime: calculateSeekTime(sequence) };
}

function updateChart(result, algorithmName) {
    const sequence = result.sequence;
    const ctx = document.getElementById('algorithmChart').getContext('2d');
    
    if (algorithmChart) {
        algorithmChart.destroy();
    }

    algorithmChart = createChart(ctx, 'line', {
        labels: sequence.map((_, i) => i),
        datasets: [{
            label: 'Head Position',
            data: sequence,
            borderColor: 'rgb(52, 152, 219)',
            backgroundColor: 'rgba(52, 152, 219, 0.1)',
            pointRadius: 6,
            tension: 0.1
        }]
    }, {
        responsive: true,
        plugins: { 
            title: { 
                display: true, 
                text: `${algorithmName} Disk Scheduling Algorithm` 
            }
        },
        scales: {
            x: { title: { display: true, text: 'Sequence Step' }, type: 'linear' },
            y: { title: { display: true, text: 'Track Position' }, min: Math.min(...sequence) - 10, max: Math.max(...sequence) + 10 }
        }
    });
}
