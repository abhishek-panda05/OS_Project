class DiskSchedulerML {
    constructor() {
        this.model = null;
        this.trainingData = [];
        this.loadTrainingData();
        this.initModel();
    }

    async initModel() {
        this.model = tf.sequential({
            layers: [
                tf.layers.dense({ inputShape: [5], units: 32, activation: 'relu' }),
                tf.layers.dense({ units: 16, activation: 'relu' }),
                tf.layers.dense({ units: 6, activation: 'softmax' })
            ]
        });

        this.model.compile({
            optimizer: tf.train.adam(0.001),
            loss: 'categoricalCrossentropy',
            metrics: ['accuracy']
        });
    }

    loadTrainingData() {
        const savedData = localStorage.getItem('diskSchedulerTrainingData');
        if (savedData) {
            this.trainingData = JSON.parse(savedData);
        }
    }

    saveTrainingData() {
        localStorage.setItem('diskSchedulerTrainingData', JSON.stringify(this.trainingData));
    }

    extractFeatures(requests, initialHead) {
        const numRequests = requests.length;
        const meanRequest = requests.reduce((a, b) => a + b, 0) / numRequests;
        const variance = requests.reduce((sum, r) => sum + Math.pow(r - meanRequest, 2), 0) / numRequests;
        const range = Math.max(...requests) - Math.min(...requests);
        const distanceFromHead = requests.reduce((sum, r) => sum + Math.abs(r - initialHead), 0) / numRequests;

        return [numRequests, meanRequest, variance, range, distanceFromHead];
    }

    async train(requests, initialHead, bestAlgorithm) {
        const features = this.extractFeatures(requests, initialHead);
        const algorithmIndex = ['fcfs', 'sstf', 'scan', 'cscan', 'look', 'clook'].indexOf(bestAlgorithm);
        
        this.trainingData.push({
            features,
            algorithm: algorithmIndex
        });

        const xs = tf.tensor2d([features]);
        const ys = tf.oneHot([algorithmIndex], 6);

        await this.model.fit(xs, ys, {
            epochs: 10,
            verbose: 0
        });

        this.saveTrainingData();
    }

    async predict(requests, initialHead) {
        const features = this.extractFeatures(requests, initialHead);
        const prediction = await this.model.predict(tf.tensor2d([features])).array();
        const algorithms = ['fcfs', 'sstf', 'scan', 'cscan', 'look', 'clook'];
        const maxIndex = prediction[0].indexOf(Math.max(...prediction[0]));
        
        return {
            algorithm: algorithms[maxIndex],
            confidence: prediction[0][maxIndex]
        };
    }

    async evaluateAllAlgorithms(scheduler, requests, initialHead) {
        const algorithms = ['fcfs', 'sstf', 'scan', 'cscan', 'look', 'clook'];
        const results = {};

        for (const algo of algorithms) {
            const result = scheduler.runAlgorithm(algo, requests, initialHead);
            results[algo] = result.totalMovement;
        }

        const bestAlgo = Object.entries(results).reduce((a, b) => a[1] < b[1] ? a : b)[0];
        await this.train(requests, initialHead, bestAlgo);

        return {
            results,
            bestAlgorithm: bestAlgo
        };
    }
}
