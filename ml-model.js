class DiskSchedulerML {
    constructor() {
        this.model = null;
        this.algorithms = ['fcfs', 'sstf', 'scan', 'cscan', 'look', 'clook'];
        this.scheduler = new DiskScheduler();
        this.initialized = false;
    }

    async initialize() {
        if (this.initialized) return;

        // Create a simple neural network
        this.model = tf.sequential({
            layers: [
                tf.layers.dense({ inputShape: [4], units: 8, activation: 'relu' }),
                tf.layers.dense({ units: 8, activation: 'relu' }),
                tf.layers.dense({ units: 6, activation: 'softmax' })
            ]
        });

        // Compile the model
        this.model.compile({
            optimizer: tf.train.adam(0.001),
            loss: 'categoricalCrossentropy',
            metrics: ['accuracy']
        });

        this.initialized = true;
    }

    // Extract features from request pattern
    extractFeatures(requests, headPosition) {
        const sorted = [...requests].sort((a, b) => a - b);
        return [
            headPosition / 200, // Normalized head position
            Math.max(...requests) / 200, // Normalized max request
            Math.min(...requests) / 200, // Normalized min request
            requests.length / 50 // Normalized request count
        ];
    }

    // Generate training data from different scenarios
    async generateTrainingData(numSamples = 1000) {
        const xs = [];
        const ys = [];

        for (let i = 0; i < numSamples; i++) {
            // Generate random scenario
            const numRequests = Math.floor(Math.random() * 20) + 5;
            const requests = Array.from({ length: numRequests }, 
                () => Math.floor(Math.random() * 200));
            const headPosition = Math.floor(Math.random() * 200);

            // Get features
            const features = this.extractFeatures(requests, headPosition);
            xs.push(features);

            // Calculate best algorithm
            this.scheduler.setParameters(requests, headPosition);
            const results = this.algorithms.map(alg => {
                return this.scheduler.runAlgorithm(alg).seekTime;
            });

            // One-hot encode the best algorithm
            const bestAlgIndex = results.indexOf(Math.min(...results));
            const oneHot = Array(6).fill(0);
            oneHot[bestAlgIndex] = 1;
            ys.push(oneHot);
        }

        return {
            xs: tf.tensor2d(xs),
            ys: tf.tensor2d(ys)
        };
    }

    // Train the model
    async train(epochs = 50) {
        await this.initialize();
        const { xs, ys } = await this.generateTrainingData();
        
        await this.model.fit(xs, ys, {
            epochs,
            batchSize: 32,
            shuffle: true,
            callbacks: {
                onEpochEnd: (epoch, logs) => {
                    console.log(`Epoch ${epoch + 1}: loss = ${logs.loss.toFixed(4)}`);
                }
            }
        });
    }

    // Predict best algorithm for given scenario
    async predict(requests, headPosition) {
        await this.initialize();
        
        const features = this.extractFeatures(requests, headPosition);
        const prediction = await this.model.predict(tf.tensor2d([features])).array();
        
        // Get algorithm with highest probability
        const maxIndex = prediction[0].indexOf(Math.max(...prediction[0]));
        const confidence = prediction[0][maxIndex];
        
        return {
            algorithm: this.algorithms[maxIndex],
            confidence: confidence
        };
    }

    // Evaluate all algorithms and return detailed comparison
    async evaluateAll(requests, headPosition) {
        this.scheduler.setParameters(requests, headPosition);
        const results = {};
        
        for (const alg of this.algorithms) {
            results[alg] = this.scheduler.runAlgorithm(alg);
        }
        
        return results;
    }
}
