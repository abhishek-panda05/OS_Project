import matplotlib.pyplot as plt

def calculate_seek_time(sequence):
    return sum(abs(sequence[i] - sequence[i-1]) for i in range(1, len(sequence)))

def fcfs(requests, initial_pos):
    sequence = [initial_pos] + requests
    return sequence, calculate_seek_time(sequence)

def sstf(requests, initial_pos):
    current, sequence, unvisited = initial_pos, [initial_pos], requests.copy()
    while unvisited:
        next_pos = min(unvisited, key=lambda x: abs(x - current))
        sequence.append(next_pos)
        current, unvisited = next_pos, [u for u in unvisited if u != next_pos]
    return sequence, calculate_seek_time(sequence)

def scan(requests, initial_pos, disk_size=200):
    sequence = [initial_pos] + sorted([r for r in requests if r >= initial_pos])
    if sequence[-1] < disk_size:
        sequence.append(disk_size)
    sequence += sorted([r for r in requests if r < initial_pos], reverse=True)
    return sequence, calculate_seek_time(sequence)

def plot_algorithm(sequence, seek_time, name, subplot_pos):
    plt.subplot(3, 1, subplot_pos)
    plt.plot(sequence, range(len(sequence)), '-o', color='blue')
    plt.title(f'{name} (Total Seek Time: {seek_time})')
    plt.xlabel('Disk Position')
    plt.ylabel('Request Sequence')
    plt.grid(True)

def visualize(requests, initial_pos):
    plt.figure(figsize=(10, 12))

    # Plot FCFS
    sequence, seek_time = fcfs(requests, initial_pos)
    plot_algorithm(sequence, seek_time, 'FCFS', 1)

    # Plot SSTF
    sequence, seek_time = sstf(requests, initial_pos)
    plot_algorithm(sequence, seek_time, 'SSTF', 2)

    # Plot SCAN
    sequence, seek_time = scan(requests, initial_pos)
    plot_algorithm(sequence, seek_time, 'SCAN', 3)

    plt.tight_layout()
    plt.show()

def main():
    requests = [98, 183, 37, 122, 14, 124, 65, 67]
    initial_pos = 53
    visualize(requests, initial_pos)

if __name__ == "__main__":
    main()
