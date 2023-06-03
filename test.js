function fetchCodeFromSubmission(contest_id, submission_id){
    return fetch(`https://corsproxy.io/?https://codeforces.com/contest/${contest_id}/submission/${submission_id}`)
        .then(function(res){
            return res.text();
        })
        .then(function(textHtml) {
            // console.log(textHtml)
            // Regular expression pattern to extract the content between <pre id="program-source-text"> and </pre>
            const regexPattern = /<pre[^>]*id="program-source-text"[^>]*>(.*?)<\/pre>/s;

            // Extract the content using the regular expression
            const match = textHtml.match(regexPattern);

            // Check if a match is found and extract the code
            if (match && match.length > 1) {
            const code = match[1];
                return code;
            } else {
                return "No result found !";
            }
        })
        .catch(function(_){
            return "No submission found !";
        });
}




// fetchCodeFromSubmission(1818,207385745)
// .then((result)=>console.log(result));


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function test(){
    let count =0;
    let start = new Date();
    while(true){
        try {
            let res = await fetch("https://codeforces.com/api/contest.status?contestId=1837&from=1&count=100&handle=shu_900");
            if(res.status != 200){
                console.log("ERROR : "+res.status.toString());
                throw new Error("error occurred")
            }
            count++;
            console.log(count);
            let current = new Date();
            if((count % 6) == 0){
                await sleep(1000);
                if((current-start) < 5000){
                    await sleep(3500);
                }
                start = new Date();
            }
        } catch (error) {
            console.log(error);
            break;
        }
    }
}

let start = new Date();
test()
.then(function(_) {
    let end = new Date();
    console.log(end-start);
})