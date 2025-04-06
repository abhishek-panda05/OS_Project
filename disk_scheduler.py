import matplotlib.pyplot as plt

# Function to calculate total seek time
def calculate_seek_time(sequence):
    return sum(abs(sequence[i] - sequence[i - 1]) for i in range(1, len(sequence)))

# FCFS Algorithm
def fcfs(requests, initial_pos):
    sequence = [initial_pos] + requests
    return sequence, calculate_seek_time(sequence)

# SSTF Algorithm
def sstf(requests, initial_pos):
    current, sequence, unvisited = initial_pos, [initial_pos], requests.copy()
    while unvisited:
        next_pos = min(unvisited, key=lambda x: abs(x - current))
        sequence.append(next_pos)
        unvisited.remove(next_pos)
        current = next_pos
    return sequence, calculate_seek_time(sequence)

# SCAN Algorithm
def scan(requests, initial_pos, disk_size=200):
    right = sorted([r for r in requests if r >= initial_pos])
    left = sorted([r for r in requests if r < initial_pos], reverse=True)
    sequence = [initial_pos] + right + [disk_size - 1] + left
    return sequence, calculate_seek_time(sequence)

# C-SCAN Algorithm
def cscan(requests, initial_pos, disk_size=200):
    right = sorted([r for r in requests if r >= initial_pos])
    left = sorted([r for r in requests if r < initial_pos])
    sequence = [initial_pos] + right + [disk_size - 1, 0] + left
    return sequence, calculate_seek_time(sequence)

# LOOK Algorithm
def look(requests, initial_pos):
    right = sorted([r for r in requests if r >= initial_pos])
    left = sorted([r for r in requests if r < initial_pos], reverse=True)
    sequence = [initial_pos] + right + left
    return sequence, calculate_seek_time(sequence)

# C-LOOK Algorithm
def clook(requests, initial_pos):
    right = sorted([r for r in requests if r >= initial_pos])
    left = sorted([r for r in requests if r < initial_pos])
    sequence = [initial_pos] + right + left
    return sequence, calculate_seek_time(sequence)

# Plotting Function
def plot_algorithm(sequence, seek_time, name, subplot_pos):
    plt.subplot(2,3, subplot_pos)
    plt.plot(sequence, range(len(sequence)), marker='o', linestyle='-', color='blue')
    plt.title(f'{name}\nTotal Seek Time: {seek_time}', fontsize=11)
    plt.xlabel('Disk Track')
    plt.ylabel('Sequence Step')
    plt.grid(True)

# Visualize All Algorithms
def visualize(requests, initial_pos):
    plt.figure(figsize=(14, 6))

    # Run and plot each algorithm
    algorithms = [
        ("FCFS", fcfs),
        ("SSTF", sstf),
        ("SCAN", scan),
        ("C-SCAN", cscan),
        ("LOOK", look),
        ("C-LOOK", clook)
    ]

    for idx, (name, algo) in enumerate(algorithms, start=1):
        sequence, seek_time = algo(requests, initial_pos)
        plot_algorithm(sequence, seek_time, name, idx)

    plt.tight_layout()
    plt.show()

# Main Execution
def main():
    requests = [123,67,63,190,154,134]
    initial_pos = 124
    visualize(requests, initial_pos)

if __name__ == "__main__":
    main()
