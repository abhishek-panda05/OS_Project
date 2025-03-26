#include <iostream>
#include <vector>
#include <algorithm>
#include <cmath>

using namespace std;

#define DISK_SIZE 200  // Disk size is from 0 to 199

// Function to calculate total seek time and print the sequence
void calculateSeekTime(vector<int> sequence, int head) {
    int seekTime = 0;
    int currentPosition = head;
    
    cout << "Seek Sequence: ";
    for (int track : sequence) {
        cout << track << " ";
        seekTime += abs(currentPosition - track);
        currentPosition = track;
    }
    
    cout << "\nTotal Seek Time: " << seekTime;
    cout << "\nAverage Seek Time: " << (double)seekTime / sequence.size() << "\n\n";
}

// First Come First Serve (FCFS) Algorithm
void fcfs(vector<int> requests, int head) {
    cout << "\nFCFS Disk Scheduling:\n";
    calculateSeekTime(requests, head);
}

// Shortest Seek Time First (SSTF) Algorithm
void sstf(vector<int> requests, int head) {
    cout << "\nSSTF Disk Scheduling:\n";
    
    vector<int> sequence;
    vector<int> remaining = requests;
    int currentPosition = head;

    while (!remaining.empty()) {
        auto closest = min_element(remaining.begin(), remaining.end(), [&](int a, int b) {
            return abs(a - currentPosition) < abs(b - currentPosition);
        });

        sequence.push_back(*closest);
        currentPosition = *closest;
        remaining.erase(closest);
    }

    calculateSeekTime(sequence, head);
}

// SCAN Algorithm (Moving Right)
void scan(vector<int> requests, int head) {
    cout << "\nSCAN Disk Scheduling:\n";

    vector<int> sortedRequests = requests;
    sort(sortedRequests.begin(), sortedRequests.end());

    vector<int> rightTracks, leftTracks;
    for (int track : sortedRequests) {
        if (track >= head) rightTracks.push_back(track);
        else leftTracks.push_back(track);
    }

    reverse(leftTracks.begin(), leftTracks.end());

    vector<int> sequence = rightTracks;
    sequence.push_back(199);  // Move to end
    sequence.insert(sequence.end(), leftTracks.begin(), leftTracks.end());

    calculateSeekTime(sequence, head);
}

// C-SCAN Algorithm
void cscan(vector<int> requests, int head) {
    cout << "\nC-SCAN Disk Scheduling:\n";

    vector<int> sortedRequests = requests;
    sort(sortedRequests.begin(), sortedRequests.end());

    vector<int> rightTracks, leftTracks;
    for (int track : sortedRequests) {
        if (track >= head) rightTracks.push_back(track);
        else leftTracks.push_back(track);
    }

    vector<int> sequence = rightTracks;
    sequence.push_back(199);  // Go to last track
    sequence.push_back(0);    // Jump to 0
    sequence.insert(sequence.end(), leftTracks.begin(), leftTracks.end());

    calculateSeekTime(sequence, head);
}

// LOOK Algorithm (Similar to SCAN but no end limit)
void look(vector<int> requests, int head) {
    cout << "\nLOOK Disk Scheduling:\n";

    vector<int> sortedRequests = requests;
    sort(sortedRequests.begin(), sortedRequests.end());

    vector<int> rightTracks, leftTracks;
    for (int track : sortedRequests) {
        if (track >= head) rightTracks.push_back(track);
        else leftTracks.push_back(track);
    }

    reverse(leftTracks.begin(), leftTracks.end());

    vector<int> sequence = rightTracks;
    sequence.insert(sequence.end(), leftTracks.begin(), leftTracks.end());

    calculateSeekTime(sequence, head);
}

// C-LOOK Algorithm
void clook(vector<int> requests, int head) {
    cout << "\nC-LOOK Disk Scheduling:\n";

    vector<int> sortedRequests = requests;
    sort(sortedRequests.begin(), sortedRequests.end());

    vector<int> rightTracks, leftTracks;
    for (int track : sortedRequests) {
        if (track >= head) rightTracks.push_back(track);
        else leftTracks.push_back(track);
    }

    vector<int> sequence = rightTracks;
    sequence.insert(sequence.end(), leftTracks.begin(), leftTracks.end());

    calculateSeekTime(sequence, head);
}

int main() {
    int n, head;
    vector<int> requests;

    cout << "Enter the number of disk requests: ";
    cin >> n;
    requests.resize(n);

    cout << "Enter the requests: ";
    for (int i = 0; i < n; i++) cin >> requests[i];

    cout << "Enter the initial head position: ";
    cin >> head;

    fcfs(requests, head);
    sstf(requests, head);
    scan(requests, head);
    cscan(requests, head);
    look(requests, head);
    clook(requests, head);

    return 0;
}