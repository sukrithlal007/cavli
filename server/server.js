const express = require('express')
const cors = require('cors');
const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const mongoose = require('mongoose');


const app = express()
const upload = multer({ dest: 'uploads/' });

app.use(cors({
    origin: 'http://localhost:3000'
}));


const mongoUrl = 'mongodb://localhost:27017/';
const mongoDBName = 'cavliDB';


// connect to MongoDB
mongoose.connect(mongoUrl + mongoDBName, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on('error', function () {
    console.log("MongoDB is not connected");

});

db.once('open', async function () {
    console.log('MongoDB is connected');
});


// Fetching values from MongoDB
var { accessKeyId, secretAccessKey } = getAWSKeys();


// Initialise s3
AWS.config.update({
    accessKeyId: 'AKIA5OANBZSEMTH4U7EE',
    secretAccessKey: '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'
});

// create an S3 object
const s3 = new AWS.S3();





const voltageSensorSchema = new mongoose.Schema({
    fileName: String,
    uploadLink: String
}, { timestamps: { createdAt: 'uploadedDate' } });

const voltageSensorModel = mongoose.model('voltage_sensors', voltageSensorSchema);




app.get("/api", (req, res) => {
    res.json({ "users": ["user1", "user2", "user3"] })
})


// Add File upload
app.post("/jsonS3Upload", upload.single('file'), (req, res) => {
    const file = req.file;
    const filePath = req.file.path;


    if (path.extname(file.originalname).toLowerCase() !== '.json'){
        res.json({ "message": "File type not permitted,Upload JSON File" });
        return false;
    }

    const fileName = file.originalname;
    const fileContent = fs.readFileSync(filePath);


    const params = {
        Bucket: "hackathon.meanstack",
        Key: fileName,
        Body: fileContent,
        ContentType: "application/json",
    };

    s3.putObject(params, (err, response) => {
        if (err) {
            message = err;
            res.json({ "message": "File could not be uploaded successfully to S3" });
        } else {
            console.log(response);
            const fileLocation = params.Bucket + '/' + fileName
            const voltageSensorData = new voltageSensorModel({
                fileName: fileName,
                uploadedDate: '',
                uploadLink: fileLocation
            });

            // Write to Database
            const dbStatus = voltageSensorToDB(voltageSensorData);
            if (dbStatus)
                res.json({ "message": "File uploaded successfully to S3 and saved to Database" });
            else
                res.json({ "message": "File uploaded successfully to S3 but not saved to Database" })

        }
    });


})

// Fetch JSON data of all objects
app.get("/viewUploadedJSON", (req, res) => {
    const params = {
        Bucket: "hackathon.meanstack",
    };


    s3.listObjects(params, (err, data) => {
        if (err) {
            console.error(err);
            res.status(500).json({ "message": 'Unable to list objects in bucket' });
        } else {
            const objectKeys = data.Contents.map(obj => obj.Key);
            res.json({ "message": "Data loaded", "items": objectKeys });
        }
    });
})

// Fetch JSON Data of one object
app.get("/viewUploadedJSON/:id", (req, res) => {
    let jsonData;
    const params = {
        Bucket: "hackathon.meanstack",
        Key: 'sample.json'
    };

    getJsonDataFromS3(params).then((jsonData) => {
        console.log("Baa")
        console.log(jsonData);
        res.json({ "message": "Haaai", "itemData": jsonData });

    }).catch((err) => {
        console.log('Error:', err);
    });





})



// Fetch AWS Credentials from mongoDB
async function getAWSKeys() {
    const awsAccesskeySchema = new mongoose.Schema({
        accessKeyId: String,
        secretAccessKey: String
    });

    const awsAccesskeyModel = mongoose.model('awsAccesskey', awsAccesskeySchema);

    awsAccesskeyModel.find()
        .then((docs) => {
            var accessKey = docs[0].accessKeyId;
            var secretKey = docs[0].secretAccessKey;

            var response = {
                accessKey,
                secretKey
            };
            return response;
        })
        .catch((err) => {
            console.error(err);
        });

}


// Save file data to mongoDB
async function voltageSensorToDB(myData) {


    try {
        await myData.save();
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }


}

// create a function to retrieve the JSON data from S3
const getJsonDataFromS3 = async (params) => {


    try {
        const { Body } = await s3.getObject(params).promise();
        const jsonData = JSON.parse(Body.toString());
        return jsonData;
    } catch (err) {
        console.log('Error retrieving JSON data from S3:', err);
        throw err;
    }
};

app.listen(5000, () => { console.log("Server started on port 5000") })