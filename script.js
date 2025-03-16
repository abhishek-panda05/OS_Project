let algorithmChart = null;

function createChart(ctx, type, data, options) {
    return new Chart(ctx, { type, data, options });
}

// Disk Scheduling Algorithms
function fcfs(tracks, head) {
    const sequence = [head, ...tracks];
    return { sequence, totalSeekTime: calculateSeekTime(sequence) };
}

function sstf(tracks, head) {
    let currentHead = head;
    let remainingTracks = [...tracks];
    const sequence = [head];

    while (remainingTracks.length > 0) {
        const nextTrack = remainingTracks.reduce((closest, track) => 
            Math.abs(track - currentHead) < Math.abs(closest - currentHead) ? track : closest
        );
        sequence.push(nextTrack);
        currentHead = nextTrack;
        remainingTracks = remainingTracks.filter(track => track !== nextTrack);
    }

    return { sequence, totalSeekTime: calculateSeekTime(sequence) };
}

function scan(tracks, head) {
    const sequence = [head];
    const sortedTracks = [...tracks].sort((a, b) => a - b);
    const maxTrack = Math.max(...tracks, head);
    
    let headIndex = sortedTracks.findIndex(track => track >= head);
    if (headIndex === -1) headIndex = sortedTracks.length;
    
    // Move right
    for (let i = headIndex; i < sortedTracks.length; i++) {
        sequence.push(sortedTracks[i]);
    }
    sequence.push(maxTrack);
    
    // Move left
    for (let i = headIndex - 1; i >= 0; i--) {
        sequence.push(sortedTracks[i]);
    }

    return { sequence, totalSeekTime: calculateSeekTime(sequence) };
}

function cscan(tracks, head) {
    const sequence = [head];
    const sortedTracks = [...tracks].sort((a, b) => a - b);
    const maxTrack = Math.max(...tracks, head);
    const minTrack = Math.min(...tracks, head);
    
    let headIndex = sortedTracks.findIndex(track => track >= head);
    if (headIndex === -1) headIndex = sortedTracks.length;
    
    // Move right
    for (let i = headIndex; i < sortedTracks.length; i++) {
        sequence.push(sortedTracks[i]);
    }
    sequence.push(maxTrack);
    sequence.push(minTrack);
    
    // Continue from start
    for (let i = 0; i < headIndex; i++) {
        sequence.push(sortedTracks[i]);
    }

    return { sequence, totalSeekTime: calculateSeekTime(sequence) };
}

function look(tracks, head) {
    const sequence = [head];
    const sortedTracks = [...tracks].sort((a, b) => a - b);
    
    let headIndex = sortedTracks.findIndex(track => track >= head);
    if (headIndex === -1) headIndex = sortedTracks.length;
    
    // Move right
    for (let i = headIndex; i < sortedTracks.length; i++) {
        sequence.push(sortedTracks[i]);
    }
    
    // Move left
    for (let i = headIndex - 1; i >= 0; i--) {
        sequence.push(sortedTracks[i]);
    }

    return { sequence, totalSeekTime: calculateSeekTime(sequence) };
}

function clook(tracks, head) {
    const sequence = [head];
    const sortedTracks = [...tracks].sort((a, b) => a - b);
    
    let headIndex = sortedTracks.findIndex(track => track >= head);
    if (headIndex === -1) headIndex = sortedTracks.length;
    
    // Move right
    for (let i = headIndex; i < sortedTracks.length; i++) {
        sequence.push(sortedTracks[i]);
    }
    
    // Continue from start
    for (let i = 0; i < headIndex; i++) {
        sequence.push(sortedTracks[i]);
    }

    return { sequence, totalSeekTime: calculateSeekTime(sequence) };
}

function calculateSeekTime(sequence) {
    let totalSeekTime = 0;
    for (let i = 1; i < sequence.length; i++) {
        totalSeekTime += Math.abs(sequence[i] - sequence[i-1]);
    }
    return totalSeekTime;
}

function updateChart(result, algorithmName) {
    const sequence = result.sequence;
    const ctx = document.getElementById('algorithmChart').getContext('2d');
    
    if (algorithmChart) algorithmChart.destroy();
    
    algorithmChart = createChart(ctx, 'line', {
        labels: Array.from({ length: sequence.length }, (_, i) => i),
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
            x: { 
                title: { display: true, text: 'Sequence Step' },
                type: 'linear',
                position: 'bottom'
            },
            y: { 
                title: { display: true, text: 'Track Position' },
                min: Math.min(...sequence) - 10,
                max: Math.max(...sequence) + 10,
                ticks: {
                    stepSize: 20
                }
            }
        }
    });
}

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
        const algorithm = document.getElementById('algorithm').value;

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
            'fcfs': 'First Come First Serve (FCFS)',
            'sstf': 'Shortest Seek Time First (SSTF)',
            'scan': 'SCAN (Elevator)',
            'cscan': 'C-SCAN',
            'look': 'LOOK',
            'clook': 'C-LOOK'
        };

        const result = algorithms[algorithm](tracks, head);

        document.getElementById('algorithm-results').innerHTML = `
            <h3>Results for ${algorithmNames[algorithm]}:</h3>
            <p><strong>Starting Head Position:</strong> ${head}</p>
            <p><strong>Track Sequence:</strong> ${result.sequence.join(' -> ')}</p>
            <p><strong>Total Seek Time:</strong> ${result.totalSeekTime} cylinders</p>
        `;

        updateChart(result, algorithmNames[algorithm]);
    };
});
