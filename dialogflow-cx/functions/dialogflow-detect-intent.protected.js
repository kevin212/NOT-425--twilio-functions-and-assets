// Imports the Google Cloud API library
const { SessionsClient } = require("@google-cloud/dialogflow-cx");

exports.handler = async function (context, event, callback) {
    let languageCode = context.DIALOGFLOW_CX_LANGUAGE_CODE;
    let query = event.utterance;

    // google requires an environment variable called GOOGLE_APPLICATION_CREDENTIALS that points to a file path with the service account key file (json) to authenticate into their API
    // to solve for this, we save the key file as a private asset, then use a helper function to find and return the path of the private asset.
    // lastly we set the environment variable dynamically at runtime so that it's in place when the sessions client is initialized
    process.env.GOOGLE_APPLICATION_CREDENTIALS =
        Runtime.getAssets()["/service-account-key.json"].path;

    // initialize the SessionsClient- https://googleapis.dev/nodejs/dialogflow-cx/latest/v3.SessionsClient.html
    const client = new SessionsClient({
        apiEndpoint: `${context.DIALOGFLOW_CX_LOCATION}-dialogflow.googleapis.com`,
    });

    // setup the detectIntentRequest - https://googleapis.dev/nodejs/dialogflow-cx/latest/google.cloud.dialogflow.cx.v3.DetectIntentRequest.html
    const request = {
        session: client.projectLocationAgentSessionPath(
            context.DIALOGFLOW_CX_PROJECT_ID,
            context.DIALOGFLOW_CX_LOCATION,
            context.DIALOGFLOW_CX_AGENT_ID,
            event.dialogflow_session_id
        ),
        queryInput: {
            text: {
                text: query,
            },
            languageCode,
        },
        queryParams: {
            //  https://cloud.google.com/dialogflow/priv/docs/reference/rpc/google.cloud.dialogflow.v3alpha1?hl=en#queryparameters
            analyzeQueryTextSentiment: true,
        },
    };

    // es6 async/await - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function
    try {
        let [response] = await client.detectIntent(request);
        console.log(response);
        callback(null, response.queryResult);
    } catch (error) {
        console.error(error);
        callback(error);
    }
};
