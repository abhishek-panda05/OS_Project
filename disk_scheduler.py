from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

def calculate_seek_time(sequence):
    return sum(abs(sequence[i] - sequence[i-1]) for i in range(1, len(sequence)))

def fcfs(tracks, head):
    sequence = [head] + tracks
    total_seek_time = calculate_seek_time(sequence)
    return {"sequence": sequence, "totalSeekTime": total_seek_time}

def sstf(tracks, head):
    sequence = [head]
    remaining = tracks.copy()
    current = head
    
    while remaining:
        distances = [abs(current - track) for track in remaining]
        min_index = distances.index(min(distances))
        next_track = remaining[min_index]
        
        current = next_track
        sequence.append(next_track)
        remaining.pop(min_index)
    
    return {"sequence": sequence, "totalSeekTime": calculate_seek_time(sequence)}

def scan(tracks, head, direction='right'):
    sorted_tracks = sorted(tracks)
    sequence = [head]
    max_track = max(tracks + [head])
    
    if direction == 'right':
        # Move right
        for track in sorted_tracks:
            if track >= head:
                sequence.append(track)
        
        if sequence[-1] != max_track:
            sequence.append(max_track)
        
        # Move left
        for track in reversed(sorted_tracks):
            if track < head:
                sequence.append(track)
    else:
        # Move left
        for track in reversed(sorted_tracks):
            if track <= head:
                sequence.append(track)
        
        if sequence[-1] != 0:
            sequence.append(0)
        
        # Move right
        for track in sorted_tracks:
            if track > head:
                sequence.append(track)
    
    return {"sequence": sequence, "totalSeekTime": calculate_seek_time(sequence)}

def cscan(tracks, head):
    sorted_tracks = sorted(tracks)
    sequence = [head]
    max_track = max(tracks + [head])
    
    # Move right until end
    for track in sorted_tracks:
        if track >= head:
            sequence.append(track)
    
    if sequence[-1] != max_track:
        sequence.append(max_track)
    
    # Jump to beginning
    sequence.append(0)
    
    # Continue from beginning
    for track in sorted_tracks:
        if track < head:
            sequence.append(track)
    
    return {"sequence": sequence, "totalSeekTime": calculate_seek_time(sequence)}

def look(tracks, head, direction='right'):
    sorted_tracks = sorted(tracks)
    sequence = [head]
    
    if direction == 'right':
        # Move right
        for track in sorted_tracks:
            if track >= head:
                sequence.append(track)
        
        # Move left
        for track in reversed(sorted_tracks):
            if track < head:
                sequence.append(track)
    else:
        # Move left
        for track in reversed(sorted_tracks):
            if track <= head:
                sequence.append(track)
        
        # Move right
        for track in sorted_tracks:
            if track > head:
                sequence.append(track)
    
    return {"sequence": sequence, "totalSeekTime": calculate_seek_time(sequence)}

def clook(tracks, head):
    sorted_tracks = sorted(tracks)
    sequence = [head]
    
    # Move right until end
    for track in sorted_tracks:
        if track >= head:
            sequence.append(track)
    
    # Continue from beginning of remaining tracks
    for track in sorted_tracks:
        if track < head:
            sequence.append(track)
    
    return {"sequence": sequence, "totalSeekTime": calculate_seek_time(sequence)}

@app.route('/calculate', methods=['POST'])
def calculate():
    data = request.json
    tracks = [int(t) for t in data['tracks']]
    head = int(data['head'])
    algorithm = data['algorithm']
    
    algorithms = {
        'fcfs': fcfs,
        'sstf': sstf,
        'scan': scan,
        'cscan': cscan,
        'look': look,
        'clook': clook
    }
    
    if algorithm not in algorithms:
        return jsonify({"error": "Invalid algorithm"}), 400
    
    result = algorithms[algorithm](tracks, head)
    return jsonify(result)

@app.route('/compare', methods=['POST'])
def compare():
    data = request.json
    tracks = [int(t) for t in data['tracks']]
    head = int(data['head'])
    
    algorithms = {
        'First Come First Serve (FCFS)': fcfs,
        'Shortest Seek Time First (SSTF)': sstf,
        'SCAN (Elevator)': scan,
        'C-SCAN': cscan,
        'LOOK': look,
        'C-LOOK': clook
    }
    
    results = {}
    for name, func in algorithms.items():
        results[name] = func(tracks, head)
    
    return jsonify(results)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
