// Extension will add a new box to sidebar
let element = document.getElementById(`sidebar`);

element.innerHTML += `
<div class="roundbox sidebox sidebar-menu borderTopRound " style="">
    <div class="caption titled">→ Accepted Codes of Friends</div>
    <div>
        <ul>
            <li>
                <span>
                    <span id="myBtn">Show Codes</span>
                </span>
            </li>
        </ul>
    </div>
</div>`;

// adding modal to the pageContent

let pageContentID = document.getElementById(`pageContent`);

pageContentID.innerHTML += `<!-- The Modal -->
<div id="myModal" class="modal">

  <!-- Modal content -->
  <div class="modal-content">
    <span class="close">&times;</span>
    <pre id="modalParapre" class="prettyprint lang-cpp linenums program-source"><code id="modalPara" class="cpp"><span class="ModalHeader">→ Accepted Codes of Friends</span><hr></code></pre>
  </div>

</div>;`

// Adding Highlighting Tools in head of content page
document.head.insertAdjacentHTML(`beforeend`, `<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.8.0/styles/atom-one-dark.min.css">
<script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.7.0/highlight.min.js"></script>
`);

// Get the modal
var modal = document.getElementById("myModal");

// Get the button that opens the modal
var btn = document.getElementById("myBtn");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks the button, open the modal 
btn.onclick = function () {
  modal.style.display = "block";
}

// When the user clicks on <span> (x), close the modal
span.onclick = function () {
  modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}

// adding the logic to fetch Codeforces API and fetch codes and change the innerHTML to the modalPara

let modalParaID = document.getElementById(`modalPara`);

// Extract problem ID from the current URL like A or B or C
function getProblemIdFromUrl() {
  const url = new URL(window.location.href);
  const path = url.pathname.split('/');
  const problemId = path[path.length - 1];
  return problemId;
}


// Extract contest ID from the current URL like 1830, 1836 $
function getContestIdFromUrl() {
  const url = new URL(window.location.href);
  const pathSegments = url.pathname.split('/');
  let contestIdIndex = -1;
  for (let i = 0; i < pathSegments.length; i++) {
    if (pathSegments[i] === 'contest') {
      contestIdIndex = i + 1;
      break;
    }
    if (pathSegments[i] === 'problemset') {
      contestIdIndex = i + 2;
      break;
    }
  }
  if (contestIdIndex !== -1 && contestIdIndex < pathSegments.length) {
    return pathSegments[contestIdIndex];
  }
  return null;
}



// fetchcode from contestid and submission id

// non-highlighted
async function fetchCodeFromSubmission(contest_id, submission_id) {
  return fetch(`https://codeforces.com/contest/${contest_id}/submission/${submission_id}`)
    .then(function (res) {
      return res.text();
    })
    .then(async function (textHtml) {
      // console.log(textHtml)
      // Regular expression pattern to extract the content between <pre id="program-source-text"> and </pre>
      const regexPattern = /<pre[^>]*id="program-source-text"[^>]*>(.*?)<\/pre>/s;

      // Extract the content using the regular expression
      const match = textHtml.match(regexPattern);

      // Check if a match is found and extract the code
      if (match && match.length > 1) {
        let code = match[1];
        return code;
      } else {
        return "No result found !";
      }
    })
    .catch(function (_) {
      return "No submission found !";
    });
}



// Fetch handles of Friends
async function getFriendsUsernameList() {
  return fetch("https://codeforces.com/friends")
    .then(function (res) {
      return res.text();
    })
    .then(function (htmlContent) {
      const parser = new DOMParser();
      // Parse the HTML content
      const parsedHtml = parser.parseFromString(htmlContent, 'text/html');

      // Access the parsed document
      const document = parsedHtml.documentElement;

      // parse usernames

      // $ Select the parent element with class "datatable"
        const datatableElement = document.getElementsByClassName('datatable')[0];

        // Select the elements with class "rated-user" inside the "datatable" element /$
        const friends_div = datatableElement.getElementsByClassName('rated-user');

      // const friends_div = document.getElementsByClassName("rated-user");
      const friends_usernames = Array.from(friends_div).map(x => x.innerText);
      return friends_usernames;
    })
}


// code of sayan 


let prblid = getProblemIdFromUrl(); // console.log(prblid);
let cntstid = getContestIdFromUrl(); // console.log(cntstid);



// Extacting Submission ID corresponding to contest id, problem id and handle $
async function getSubmissionId(contestIds, problemIds, handles) {
  let response = await fetch(`https://codeforces.com/api/contest.status?contestId=${contestIds}&from=1&count=10&handle=${handles}`);
  let data = await response.json();

  // Filter submissions for the desired problem and ver dict
  let submissions = data.result.filter(submission => {
    return submission.contestId === contestIds
      && submission.problem.index === problemIds
      && submission.verdict === "OK";
  });

  // Return the submission ID if found
  if (submissions.length > 0) {
    return submissions[0].id;
  }

  // Return null if no submission with 'OK' verdict found
  return -1;

}
  



// Sleep Function to hold a Program to execute
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}





let contestId = Number(cntstid);
let problemId = String(prblid);
let handle = 'dhruboneogi10';

// Getting list of friends using parser in a promise object
let friendsPromise = getFriendsUsernameList();

// Variables for making the code to wait 
let count =0;
let start = new Date();

// Prints fetched code in Modal
friendsPromise.then(async function (data) {
  for (let i = 0; i < data.length; i++) {
    handle = data[i];
    // console.log(handle);

    // Print Submission ID in console
    let submissionId = await getSubmissionId(contestId, problemId, handle);
    // console.log(submissionId);

      // made the function to wait
      count++;
      // console.log(count);
      let current = new Date();
      if ((count % 6) == 0) {
        await sleep(1000);
        if ((current - start) < 5000) {
          await sleep(3500);
        }
        start = new Date();
      }// end wait function


    
    // Add code to Modal Corresponding to Submission ID
    await fetchCodeFromSubmission(contestId, Number(submissionId))
    .then(async function (Code) {
        modalParaID.innerHTML += `<span id="TextModal">Code submitted by </span><span id="HandleModal">${handle}\n\n </span>`;

        // Add a span element with a CSS class around the Code variable
        // highlight code
        let highlighted_code = hljs.highlightAuto(Code).value;
        modalParaID.innerHTML += `<span class="codeSnippet">${highlighted_code}\n\n</span>`;
    });
  }
});

