import random
import csv

# Dataset Configuration
num_requests = 1000  # Number of disk requests
cylinder_range = (0, 199)  # Disk cylinders range

# CSV File Setup
csv_file = "synthetic_disk_data.csv"
fields = ["Request_ID", "Arrival_Time", "Cylinder_No", "Burst_Time", "Prev_Head", 
          "Curr_Head", "Request_Type", "Queue_Len", "Seek_Time"]

with open(csv_file, "w", newline="") as file:
    writer = csv.writer(file)
    writer.writerow(fields)  # Write header

# Generate Requests
prev_head = random.randint(*cylinder_range)  # Initial head position
arrival_time = 0  # Start time from 0

for request_id in range(1, num_requests + 1):
    arrival_time += random.uniform(0.1, 2)  # Each request comes after 0.1 to 2 seconds
    arrival_time = round(arrival_time, 2)  # Round to 2 decimal places

    cylinder_no = random.randint(*cylinder_range)  # Random cylinder request
    burst_time = random.randint(1, 10)  # Random burst time (1-10 ms)
    curr_head = cylinder_no  # Head moves to requested cylinder
    request_type = random.choice(["Read", "Write"])  # Read/Write request
    queue_len = random.randint(1, 10)  # Random queue length

    # Seek Time Calculation: |Current - Previous| (assuming seek factor = 0.1 ms per cylinder)
    seek_time = round(abs(curr_head - prev_head) * 0.1, 2)

    # Save Data
    with open(csv_file, "a", newline="") as file:
        writer = csv.writer(file)
        writer.writerow([request_id, arrival_time, cylinder_no, burst_time, prev_head, 
                         curr_head, request_type, queue_len, seek_time])

    prev_head = curr_head  # Update previous head position

print(f"Synthetic disk scheduling dataset generated: {csv_file}")
