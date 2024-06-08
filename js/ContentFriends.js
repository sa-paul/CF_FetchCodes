// Content addition to id="sidebar" of CF Problem-Page 
let sidebarID = document.getElementById(`sidebar`);

// Adding a new box-section to sidebar
/*  The Box will contain heading and button as follows:
*   → Accepted Codes of Friends     
*     Show Codes
*/
sidebarID.innerHTML += `
<div class="roundbox sidebox sidebar-menu borderTopRound " style="">
    <div class="caption titled">→ Accepted Codes of Friends</div>
    <div>
        <ul>
            <li>
                <span>
                    <span id="showCodeButton">Show Codes</span>
                </span>
            </li>
        </ul>
    </div>
</div>`;


// Adding Modal to the pageContent to Show Codes on clicking
let pageContentID = document.getElementById(`pageContent`);
/*  The 3 layers of Modals as follows:
*   Modal (default hidden)
*     Modal Contents 
*       Modal Codes (section for codes) & Modal Close (closing button)
*         Modal Code Header
*/
pageContentID.innerHTML += `
<div id="modal" class="modal">
  <div class="modalContent">
    <span class="modalClose">&times;</span>
    <pre id="modalCode" ><code><span class="modalCodeHeader">→ Accepted Codes of Friends</span><hr></code></pre>
  </div>
</div>;`

/*
*   Declaring variables corresponding to class and id
*     Adding Modal effects on clicking 
*/

// Get the modal
const modalID = document.getElementById("modal");

// Get the button that opens the modal
const showCodeButtonID = document.getElementById("showCodeButton");

// Get the <span> element that closes the modal
const modalCloseID = document.getElementsByClassName("modalClose")[0];

// Get the Modal Code in which codes wil be added 
const modalCodeID = document.getElementById(`modalCode`);

// When the user clicks the Show Code button, open the modal 
showCodeButtonID.onclick = function () {
  modalID.style.display = "block";
}

// When the user clicks on <span> (x), i.e Modal Close, close the modal
modalCloseID.onclick = function () {
  modalID.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close modal
window.onclick = function (event) {
  if (event.target == modalID) {
    modalID.style.display = "none";
  }
}


/*
*   Declaring and defining functions 
*     1. getProblemIdFromUrl()     => Extract problem ID from the current URL
*     2. getContestIdFromUrl()     => Extract contest ID from the current URL
*     3. getFriendsUsernameList()  => Extract Handles of User's CF Friends
*     4. getSubmissionId()         => Extacting Submission ID corresponding to contest ID, submission ID and Handle
*     5. fetchCodeFromSubmission() => Extract codes from contest ID and submission ID
*     6. sleep()                   => Sleep Function to reduce URL fetch-rate
*     7. Add Fetched Codes to Modal
*/

// Extract problem ID from the current URL like A or B or C
function getProblemIdFromUrl() {
  const url = new URL(window.location.href);
  const path = url.pathname.split('/');
  const problemId = path[path.length - 1];
  return problemId;
}

// Extract contest ID from the current URL like 1830, 1836 
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

// Extract Handles of User's CF Friends 
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

      //  Select the parent element with class "datatable"
        const datatableElement = document.getElementsByClassName('datatable')[0];

        // Select the elements with class "rated-user" inside the "datatable" element /$
        const friends_div = datatableElement.getElementsByClassName('rated-user');

      // const friends_div = document.getElementsByClassName("rated-user");
      const friends_usernames = Array.from(friends_div).map(x => x.innerText);
      return friends_usernames;
    })
}

// Assigning Problem ID and Contest ID to respective variables 
const Problem_ID_const = getProblemIdFromUrl(); // console.log(Problem_ID_const);
const Contest_ID_const = getContestIdFromUrl(); // console.log(Contest_ID_const);

// Extacting Submission ID corresponding to contest ID, submission ID and Handle
async function getSubmissionId(contestIds, problemIds, handles) {
  let response = await fetch(`https://codeforces.com/api/contest.status?contestId=${contestIds}&handle=${handles}`);
  let data = await response.json();

  // Filter submissions for the desired problem and ver dict
  if(data.result && data.result.length > 0){
    let submissions = data.result.filter(submission => {
      return submission.contestId === contestIds
        && submission.problem.index === problemIds
        && submission.verdict === "OK";
    });
    // Return the submission ID if found
    if (submissions.length > 0) {
      return [submissions[0].id,submissions[0].programmingLanguage];
    }
  }
  // Return -1 if no submission with 'OK' verdict found
  return [-1,"No Code Found"];
}

// Extract codes from contest ID and submission ID
async function fetchCodeFromSubmission(contest_id, submission_id) {
  return await fetch(`https://codeforces.com/contest/${contest_id}/submission/${submission_id}`)
    .then(async function (res) {
      return await res.text();
    })
    .then(async function (textHtml) {   // console.log(textHtml)
      // Regular expression pattern to extract the content between <pre id="program-source-text"> and </pre>
      const regexPattern =  /<pre[^>]*id="program-source-text"[^>]*>(.*?)<\/pre>/s;

      // Extract the content using the regular expression
      const match =  textHtml.match(regexPattern);

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

// convert html entities in notaion 
function convertHtmlEntities(codeSnippet) {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = codeSnippet;
  return textarea.value;
}

// getting the alias for highlight js wrt problem language
function getHighlightJsAlias(language) {
  let alias;
  switch (language) {
      // Existing cases remain unchanged
      case 'GNU GCC':
      case 'GNU G++14':
      case 'C++20 (GCC 13-64)':
      case 'C++17 (GCC 7-32)':
      case 'C++14 (GCC 6-32)':
      case 'GNU C++':
      case 'GNU C11':
      case 'GNU G++20':
          alias = 'cpp';
          break;
      case 'C# 8':
      case 'C# 10':
      case 'C#':
      case 'Mono C#':
          alias = 'csharp';
          break;
      case 'Go':
          alias = 'go';
          break;
      case 'Haskell GHC':
      case 'Haskell':
          alias = 'haskell';
          break;
      case 'Java':
      case 'Java 8':
      case 'Java 11':
      case 'Java 21':
          alias = 'java';
          break;
      case 'Kotlin':
      case 'Kotlin 1.7':
      case 'Kotlin 1.9':
          alias = 'kotlin';
          break;
      case 'Delphi':
      case 'Free Pascal':
      case 'PascalABC.NET':
      case 'Delphi 10':
          alias = 'delphi';
          break;
      case 'PHP':
      case 'PHP 7':
          alias = 'php';
          break;
      case 'Python':
      case 'Python 2':
      case 'Python 3':
      case 'PyPy':
      case 'PyPy 2':
      case 'PyPy 3':
      case 'PyPy 3-64':
          alias = 'python';
          break;
      case 'Ruby':
      case 'Ruby 3':
          alias = 'ruby';
          break;
      case 'Rust':
      case 'Rust 2021':
          alias = 'rust';
          break;
      case 'Scala':
          alias = 'scala';
          break;
      case 'Node.js':
          alias = 'nodejs';
          break;
      default:
          alias = 'cpp';
  }
  return alias;
}


// Sleep Function to reduce URL fetch-rate
function sleep(miliSecond) {
  return new Promise(resolve => setTimeout(resolve, miliSecond));
}

// Variables for reducing code execution
let count =0;
let start = new Date();

// Variables to be passed in function getSubmissionId()
let contestId = Number(Contest_ID_const);
let problemId = String(Problem_ID_const);

// Getting list of friends using parser in a promise object
let friendsPromise = getFriendsUsernameList();

// to check if code has changed or not 
var prevCode="No Submission Found!",prevSubmissionID=12345678;

// Add Fetched Codes to Modal
friendsPromise.then(async function (data) {
  // For each Handle Fetch and Add Codes to Modal
  for (let i = 0; i < data.length; i++) {
    let handle = data[i];            // console.log(handle);

    // Print Submission ID in console
    let idLang = await getSubmissionId(contestId, problemId, handle);  
    let submissionId = idLang[0],lang =idLang[1];
    submissionId=Number(submissionId);

    // made the function to wait to reduce fetch-rate to avoid being block
    count++;                         
    let current = new Date();
    if ((count % 6) == 0) {
      await sleep(1000);
      if ((current - start) < 5000) {
        await sleep(3500);
      }
      start = new Date();
    }// end wait function
    
    // when submission with verdict "ok" not found, don't add any code
    if (submissionId != -1 && !isNaN(submissionId)) { 
      // Add Codes to Modal Corresponding to Submission ID
      var Code = await fetchCodeFromSubmission(contestId, submissionId);
      if(prevCode!= Code && prevSubmissionID != submissionId){
      // .then(async function (Code) {
          modalCodeID.innerHTML += `<span id="TextModal">Code submitted by </span><a href="https://codeforces.com/profile/${handle}" id="HandleModal" target="_blank">${handle}\n\n </a>`;

          const aliasLang = getHighlightJsAlias(lang);
          var hightlightedCode =hljs.highlight(Code,{language:aliasLang}).value
          modalCodeID.innerHTML += `<pre><code >${convertHtmlEntities(hightlightedCode)}</code></pre>\n\n`;
        // });
        }
        prevSubmissionID= submissionId;
        prevCode=Code;
      }
    }
});

