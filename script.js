// ===========================================
//  DIGITAL ESCAPE ROOM - Lab 204
//  Simple beginner-level JavaScript
// ===========================================

// -- Questions array --
var questions = [
    // Door 1 - Binary
    {
        door: 1, doorName: "DOOR 1", cat: "BINARY SECURITY LOCK",
        text: "🔢 What is the binary number 1010 in decimal?",
        opts: ["8", "10", "12", "14"],
        ans: 1,
        hint: "💡 1×8 + 0×4 + 1×2 + 0×1 = ?"
    },
    {
        door: 1, doorName: "DOOR 1", cat: "BINARY SECURITY LOCK",
        text: "🔢 How many values can 4 bits represent?",
        opts: ["4", "8", "16", "32"],
        ans: 2,
        hint: "💡 2 raised to the power of 4 = ?"
    },
    // Door 2 - Web
    {
        door: 2, doorName: "DOOR 2", cat: "WEB SECURITY LOCK",
        text: "🌐 Which language is used to structure a webpage?",
        opts: ["CSS", "Python", "HTML", "SQL"],
        ans: 2,
        hint: "💡 It stands for HyperText Markup Language."
    },
    {
        door: 2, doorName: "DOOR 2", cat: "WEB SECURITY LOCK",
        text: "🎨 Which CSS property changes the text color?",
        opts: ["font-size", "text-align", "color", "padding"],
        ans: 2,
        hint: "💡 The property name IS the thing you want to change!"
    },
    // Door 3 - Logic
    {
        door: 3, doorName: "DOOR 3", cat: "LOGIC SECURITY LOCK",
        text: "🧩 What comes next: 2, 4, 8, 16, __?",
        opts: ["20", "24", "30", "32"],
        ans: 3,
        hint: "💡 Each number is double the previous one."
    },
    {
        door: 3, doorName: "DOOR 3", cat: "LOGIC SECURITY LOCK",
        text: "🧩 If all Roses are Flowers, and some Flowers are Red, which is TRUE?",
        opts: ["All Roses are Red", "Some Roses may be Red", "No Roses are Red", "All Flowers are Roses"],
        ans: 1,
        hint: "💡 'All' and 'Some' are different. We only know SOME flowers are red."
    },
    // Door 4 (Exit) - Riddles
    {
        door: 4, doorName: "FINAL EXIT", cat: "RIDDLE LOCK",
        text: "🤔 I have keys but no locks. I have space but no room. You can enter but can't go inside. What am I?",
        opts: ["A Map", "A Keyboard", "A Book", "A Phone"],
        ans: 1,
        hint: "💡 You're probably using one right now to answer this quiz!"
    },
    {
        door: 4, doorName: "FINAL EXIT", cat: "RIDDLE LOCK",
        text: "🤔 I speak without a mouth and hear without ears. I have no body, but come alive with the wind. What am I?",
        opts: ["A Shadow", "An Echo", "A Ghost", "A Cloud"],
        ans: 1,
        hint: "💡 Shout in a canyon and you'll meet me."
    }
];

// -- Game state --
var playerNameStr = "Agent";  // player's name
var cur = 0;            // current question index
var score = 0;          // total score
var lives = 3;          // lives left
var keys = 0;           // keys found
var streak = 0;         // current streak
var best = 0;           // best streak
var pick = -1;          // selected option
var hinted = false;     // hint used this question
var done = false;       // answer submitted
var secs = 300;         // 5 minutes timer
var tick = null;        // timer interval
var answers = [];       // saved player answers
var doorOk = [0,0,0,0]; // correct count per door
var startTime = 0;      // when game started (for time taken)

// -- Helper to get elements --
function el(id) {
    return document.getElementById(id);
}

// ========== WELCOME SCREEN ==========

// Start button click
el("startBtn").addEventListener("click", function() {
    var name = el("nameInput").value.trim();
    if (name === "") {
        name = "Agent";
    }
    playerNameStr = name;

    // hide welcome, show game
    el("welcomeScreen").style.display = "none";
    el("gameArea").style.display = "block";
    el("playerName").textContent = playerNameStr;

    // record start time
    startTime = Date.now();

    // start the game
    loadQ();
    startClock();
});

// Allow pressing Enter to start
el("nameInput").addEventListener("keydown", function(e) {
    if (e.key === "Enter") {
        el("startBtn").click();
    }
});

// ========== LOAD QUESTION ==========
function loadQ() {
    // reset for new question
    pick = -1;
    hinted = false;
    done = false;

    var q = questions[cur];

    // update card info
    el("qDoor").textContent = "🚪 " + q.doorName;
    el("qCat").textContent = q.cat;
    el("qCounter").textContent = "Question " + (cur + 1) + " / 8";
    el("qText").textContent = q.text;

    // build option buttons
    var h = "";
    for (var i = 0; i < q.opts.length; i++) {
        h += '<div class="opt-btn" id="o' + i + '" onclick="pickOpt(' + i + ')">';
        h += '<div class="circle"></div>';
        h += '<span>' + q.opts[i] + '</span>';
        h += '</div>';
    }
    el("optsArea").innerHTML = h;

    // reset hint
    el("hintBtn").className = "hint-btn";
    el("hintBtn").style.display = "inline-block";
    el("hintBox").textContent = "";
    el("hintBox").className = "hint-box";

    // reset buttons
    el("submitBtn").disabled = false;
    el("submitBtn").style.display = "block";
    el("nextBtn").style.display = "none";

    // reset feedback
    el("fbArea").style.display = "none";
    el("fbArea").className = "fb";

    // update progress bar
    var pct = Math.round((cur / 8) * 100);
    el("pFill").style.width = pct + "%";
    el("pText").textContent = "Progress: " + pct + "%";

    // terminal message
    tLog("> Loading " + q.doorName + "...");
    tLog("> " + q.cat);
    tLog("> Waiting for answer...");
}

// ========== PICK OPTION ==========
function pickOpt(i) {
    if (done) return;
    pick = i;

    // remove selection from all
    var all = document.querySelectorAll(".opt-btn");
    for (var j = 0; j < all.length; j++) {
        all[j].classList.remove("selected");
    }
    // mark selected
    el("o" + i).classList.add("selected");
}

// ========== HINT ==========
el("hintBtn").addEventListener("click", function() {
    if (hinted || done) return;
    hinted = true;
    el("hintBox").textContent = questions[cur].hint;
    el("hintBox").classList.add("visible");
    el("hintBtn").classList.add("dim");

    // deduct 10 points
    score = Math.max(0, score - 10);
    el("scoreCount").textContent = score;
    tLog("> HINT USED. -10 points.");
});

// ========== SUBMIT ANSWER ==========
el("submitBtn").addEventListener("click", function() {
    // check if option selected
    if (pick === -1) {
        alert("⚠️ Please select an answer first!");
        return;
    }

    done = true;
    var q = questions[cur];
    var right = (pick === q.ans);

    // save the answer
    answers.push({
        qi: cur,
        picked: pick,
        pickedTxt: q.opts[pick],
        correctTxt: q.opts[q.ans],
        ok: right
    });

    // freeze all options
    var all = document.querySelectorAll(".opt-btn");
    for (var j = 0; j < all.length; j++) {
        all[j].classList.add("frozen");
    }

    // always show correct answer in green
    el("o" + q.ans).classList.add("correct-opt", "green-glow");

    var fb = el("fbArea");

    if (right) {
        // CORRECT
        score += 100;
        streak++;
        if (streak > best) best = streak;
        doorOk[q.door - 1]++;

        fb.innerHTML = "✅ CORRECT!<br>🔓 Access granted!<br>🔑 You found a clue!";
        fb.className = "fb fb-good";

        tLog("> ACCESS GRANTED!");
        tLog("> Door security updated...");
    } else {
        // WRONG
        lives--;
        streak = 0;

        // show wrong in red with shake
        el("o" + pick).classList.add("wrong-opt", "red-shake");

        fb.innerHTML = "❌ WRONG ANSWER!<br>⚠️ Security alarm activated!<br>❤️ One life lost.<br><br>" +
            "❌ Your answer: " + q.opts[pick] + "<br>" +
            "✅ Correct answer: " + q.opts[q.ans] + "<br>💥 Streak broken!";
        fb.className = "fb fb-bad";

        updateLives();
        tLog("> ACCESS DENIED!");
        tLog("> WARNING: Incorrect answer.");
    }

    // update score and streak display
    el("scoreCount").textContent = score;
    el("streakCount").textContent = streak;

    // hide submit and hint
    el("submitBtn").style.display = "none";
    el("hintBtn").style.display = "none";

    // check game over (no lives)
    if (lives <= 0) {
        clearInterval(tick);
        setTimeout(function() {
            el("ovGameOver").classList.add("on");
        }, 600);
        return;
    }

    // check if door is finished (every 2 questions)
    if ((cur + 1) % 2 === 0) {
        var di = q.door - 1;
        if (doorOk[di] === 2) {
            // door fully cleared
            keys++;
            el("keyCount").textContent = keys;
            setDoorDone(q.door);

            if (q.door === 4) {
                // ESCAPED!
                clearInterval(tick);
                setTimeout(function() {
                    el("ovEscape").classList.add("on");
                }, 500);
                return;
            } else {
                // show door unlocked popup
                setTimeout(function() {
                    openDoorPop(q.door);
                }, 500);
                return;
            }
        } else {
            // door partially done
            setDoorPartial(q.door);
        }
    }

    // show next button or finish
    if (cur < 7) {
        el("nextBtn").style.display = "block";
    } else {
        clearInterval(tick);
        setTimeout(showReport, 800);
    }
});

// ========== NEXT QUESTION ==========
el("nextBtn").addEventListener("click", function() {
    cur++;
    el("hintBtn").style.display = "inline-block";
    if (cur < 8) {
        loadQ();
    } else {
        clearInterval(tick);
        showReport();
    }
});

// ========== DOOR POPUP ==========
function openDoorPop(n) {
    el("popDoorTitle").textContent = "🔓 DOOR " + n + " UNLOCKED!";
    el("popDoorMsg").textContent = "🔑 KEY " + n + " COLLECTED!";
    el("ovDoor").classList.add("on");
}

function closeDoorPop() {
    el("ovDoor").classList.remove("on");
    cur++;
    el("hintBtn").style.display = "inline-block";
    if (cur < 8) {
        loadQ();
    } else {
        clearInterval(tick);
        showReport();
    }
}

// ========== DOOR STATUS UPDATES ==========
function setDoorDone(n) {
    var s = el("ds" + n);
    s.textContent = "✅ CLEARED";
    s.className = "d-done";
    el("d" + n).classList.add("unlocked");

    // open next door
    if (n < 4) {
        var nx = el("ds" + (n + 1));
        nx.textContent = "🔓 OPEN";
        nx.className = "d-open";
    }
}

function setDoorPartial(n) {
    var s = el("ds" + n);
    s.textContent = "⚠️ PARTIAL";
    s.className = "d-open";

    // still open next door
    if (n < 4) {
        var nx = el("ds" + (n + 1));
        nx.textContent = "🔓 OPEN";
        nx.className = "d-open";
    }
}

// ========== TIMER ==========
function startClock() {
    tick = setInterval(function() {
        secs--;
        if (secs <= 0) {
            clearInterval(tick);
            el("clock").textContent = "00:00";
            el("ovTimeUp").classList.add("on");
            return;
        }
        var m = Math.floor(secs / 60);
        var s = secs % 60;
        el("clock").textContent = (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s;
    }, 1000);
}

// ========== UPDATE LIVES ==========
function updateLives() {
    var t = "";
    for (var i = 0; i < lives; i++) {
        t += "❤️ ";
    }
    if (lives <= 0) t = "💀";
    el("livesBox").textContent = t.trim();
}

// ========== TERMINAL LOG ==========
function tLog(msg) {
    var p = document.createElement("p");
    p.textContent = msg;
    el("tBody").appendChild(p);
    el("tBody").scrollTop = el("tBody").scrollHeight;
}

// ========== CALCULATE TIME TAKEN ==========
function getTimeTaken() {
    var elapsed = Math.floor((Date.now() - startTime) / 1000);
    var m = Math.floor(elapsed / 60);
    var s = elapsed % 60;
    return (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s;
}

function getTimeRemaining() {
    var m = Math.floor(secs / 60);
    var s = secs % 60;
    return (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s;
}

// ========== GET RANK ==========
function getRank(correct) {
    if (correct === 8) return "🏆 Master Hacker";
    if (correct >= 6) return "🥇 Senior Agent";
    if (correct >= 4) return "🥈 Junior Agent";
    if (correct >= 2) return "🥉 Trainee";
    return "📚 Rookie";
}

// ========== SHOW RESULTS ==========
function showReport() {
    // hide game area and overlays
    el("gameArea").style.display = "none";
    el("ovEscape").classList.remove("on");
    el("ovGameOver").classList.remove("on");
    el("ovTimeUp").classList.remove("on");
    el("ovDoor").classList.remove("on");

    // count correct answers
    var correct = 0;
    for (var k = 0; k < answers.length; k++) {
        if (answers[k].ok) correct++;
    }

    // agent badge
    var rank = getRank(correct);
    el("agentBadge").innerHTML =
        '<div class="badge-name">🕵️ Agent: ' + playerNameStr + '</div>' +
        '<div class="badge-rank">Rank: ' + rank + '</div>';

    // build report cards
    var box = el("reportArea");
    box.innerHTML = "";

    for (var i = 0; i < 8; i++) {
        var q = questions[i];
        var div = document.createElement("div");
        div.className = "rc";

        // find player's answer
        var a = null;
        for (var j = 0; j < answers.length; j++) {
            if (answers[j].qi === i) {
                a = answers[j];
                break;
            }
        }

        var html = '<div class="rc-label">Question ' + (i + 1) + ' — ' + q.doorName + '</div>';
        html += '<div class="rc-q">' + q.text + '</div>';

        if (a) {
            html += '<div class="rc-line rc-user">Your Answer: ' + a.pickedTxt + '</div>';
            html += '<div class="rc-line rc-ans">Correct Answer: ' + q.opts[q.ans] + '</div>';
            if (a.ok) {
                div.classList.add("rc-yes");
                html += '<div class="rc-tag tag-yes">✅ CORRECT</div>';
            } else {
                div.classList.add("rc-no");
                html += '<div class="rc-tag tag-no">❌ INCORRECT</div>';
            }
        } else {
            html += '<div class="rc-line rc-user">Your Answer: — (not reached)</div>';
            html += '<div class="rc-line rc-ans">Correct Answer: ' + q.opts[q.ans] + '</div>';
            div.classList.add("rc-no");
            html += '<div class="rc-tag tag-no">⏭️ NOT REACHED</div>';
        }

        div.innerHTML = html;
        box.appendChild(div);
    }

    // final summary
    var wrong = 8 - correct;
    var acc = Math.round((correct / 8) * 1000) / 10;
    var timeTaken = getTimeTaken();
    var timeLeft = getTimeRemaining();

    var sh = "";
    if (correct === 8) {
        sh += '<h2>🏆 PERFECT ESCAPE!</h2>';
    } else {
        sh += '<h2>🎉 QUIZ COMPLETE!</h2>';
    }

    sh += '<div class="sum-lines">';
    sh += '🕵️ Agent: ' + playerNameStr + '<br>';
    sh += '🏆 Score: ' + score + ' / 800<br>';
    sh += '✅ Correct: ' + correct + '<br>';
    sh += '❌ Incorrect: ' + wrong + '<br>';
    sh += '📊 Accuracy: ' + acc + '%<br>';
    sh += '🔥 Best Streak: ' + best + '<br>';
    sh += '❤️ Lives Remaining: ' + lives + '<br>';
    sh += '🔑 Keys Collected: ' + keys + ' / 4<br>';
    sh += '⏱️ Time Taken: ' + timeTaken + '<br>';
    sh += '⏱️ Time Remaining: ' + timeLeft + '<br>';
    sh += '🎖️ Rank: ' + rank;
    sh += '</div>';

    sh += '<div class="sum-msg">';
    if (correct === 8) {
        sh += 'You answered all 8 questions correctly!<br>🎉 Congratulations, Escape Agent ' + playerNameStr + '!';
    } else if (correct >= 6) {
        sh += '🚀 Great job, ' + playerNameStr + '! You almost made a perfect escape!';
    } else if (correct >= 4) {
        sh += '🙂 Nice try, ' + playerNameStr + '! The lab was difficult, but you learned something new!';
    } else {
        sh += '📚 Keep studying, ' + playerNameStr + '! Lab 204 has more secrets to uncover.';
    }
    sh += '</div>';

    el("sumArea").innerHTML = sh;

    // show results page
    el("resultsPage").classList.add("on");
}

// ========== RESTART GAME ==========
function restart() {
    // reset all variables
    cur = 0;
    score = 0;
    lives = 3;
    keys = 0;
    streak = 0;
    best = 0;
    pick = -1;
    hinted = false;
    done = false;
    secs = 300;
    answers = [];
    doorOk = [0,0,0,0];

    // clear timer
    if (tick) clearInterval(tick);

    // hide overlays and results
    el("ovGameOver").classList.remove("on");
    el("ovTimeUp").classList.remove("on");
    el("ovDoor").classList.remove("on");
    el("ovEscape").classList.remove("on");
    el("resultsPage").classList.remove("on");

    // show welcome screen
    el("gameArea").style.display = "none";
    el("welcomeScreen").style.display = "block";

    // reset displays
    el("scoreCount").textContent = "0";
    el("streakCount").textContent = "0";
    el("keyCount").textContent = "0";
    el("clock").textContent = "05:00";
    updateLives();

    // reset doors
    el("ds1").textContent = "🔓 OPEN";  el("ds1").className = "d-open";  el("d1").classList.remove("unlocked");
    el("ds2").textContent = "🔒 LOCKED"; el("ds2").className = "d-locked"; el("d2").classList.remove("unlocked");
    el("ds3").textContent = "🔒 LOCKED"; el("ds3").className = "d-locked"; el("d3").classList.remove("unlocked");
    el("ds4").textContent = "🔒 LOCKED"; el("ds4").className = "d-locked"; el("d4").classList.remove("unlocked");

    // reset terminal
    el("tBody").innerHTML =
        "<p>> SYSTEM RESTARTING...</p>" +
        "<p>> Lab 204 re-secured.</p>" +
        "<p>> Good luck!</p>";

    // reset hint
    el("hintBtn").style.display = "inline-block";

    // reset progress
    el("pFill").style.width = "0%";
    el("pText").textContent = "Progress: 0%";
}
