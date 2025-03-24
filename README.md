# Disk Scheduling Algorithm Simulator

This web application simulates various disk scheduling algorithms and visualizes their performance.

## Supported Algorithms

1. First Come First Serve (FCFS)
2. Shortest Seek Time First (SSTF)
3. SCAN (Elevator)
4. C-SCAN
5. LOOK
6. C-LOOK

## Setup Instructions

1. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Start the Flask server:
   ```bash
   python disk_scheduler.py
   ```

3. Open `index.html` in your web browser

## How to Use

1. Enter track positions as comma-separated numbers (e.g., 98,183,37,122,14,124,65,67)
2. Enter the initial head position (e.g., 53)
3. Select an algorithm from the dropdown
4. Click "Calculate" to see the results

The application will show:
- The sequence of track movements
- Total seek time
- A line graph showing the head movement
- A comparison of all algorithms' performance
