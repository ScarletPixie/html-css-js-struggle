//	https://opentdb.com/api_config.php
const AMOUNT = 10;
const QUESTIONS_CONTENT = document.querySelector("#question-content");
const QUESTIONS_URL = `https://opentdb.com/api.php?amount=${AMOUNT}`;

setInitialEvents();

//	fetch questions from API passed in URL
async function fetchQuestions(URL)
{
	try
	{
		const response = await fetch(URL);
		
		if (!response.ok)
			throw new Error(`Error: ${response.status}`);

		const data = await response.json();
		return data;
	}
	catch (error)
	{
		console.error(`Error: ${error}`);
	}
}

async function isQuestionCorrect(response_data, questionIdx)
{
	const data = await response_data;
	const choices = document.querySelectorAll('input[type="radio"]');
	let noChecked = true;

	for (choice of choices)
	{
		if (choice.checked)
			noChecked = false;
		if (choice.checked && choice.value === data.results[questionIdx].correct_answer)
			return 1;
	}

	if (noChecked)
		return -1;
	return (0);
}

async function loadQuestion(response_data, questionIdx)
{
	const data = await response_data;
	const questionContext = data.results[questionIdx];

	const question = document.createElement('legend');

	//	sanitize html content
	const tmp = document.createElement('span');
	tmp.innerHTML = questionContext.question;
	question.textContent = tmp.textContent;
	
	//	join correct answers in incorrect_answers array in random psition
	if (!questionContext.incorrect_answers.includes(questionContext.correct_answer))
		insertRandom(questionContext.incorrect_answers, questionContext.correct_answer);
	//	create labels and radio inputs with choices;
	const choices = [];
	for (answer of questionContext.incorrect_answers)
	{
		const choice_label = document.createElement('label');
		const choice = document.createElement('input');
		
		choice.type = 'radio';
		choice.value = answer;
		choice.name = 'choice';
		
		choice_label.appendChild(choice);
		choice_label.appendChild(document.createTextNode(answer));
		
		choices.push(choice_label);
	}

	//	empty fieldset and populate with new question
	QUESTIONS_CONTENT.innerHTML = '';
	QUESTIONS_CONTENT.appendChild(question);
	for (choice of choices)
		QUESTIONS_CONTENT.appendChild(choice);
	
	console.log(questionContext);
	data.results[questionIdx];
}

//	start, reset, help
function setInitialEvents()
{
	document.querySelector('#play').addEventListener('click', startGame);
	document.querySelector('#help').addEventListener('click', showHelp);
	document.querySelector('#reset').addEventListener('click', () => {	
		const reset = window.confirm("are you sure you wanna reset (points will be lost).");
		if (!reset)
			return;
		startGame();
	});
}

function startGame()
{
	let score = 0;
	let questionIdx = 0;

	QUESTIONS_CONTENT.innerHTML = '';
	const answerBt = document.querySelector('#answer');
	const navigationDiv = document.querySelector(".navigation");
	navigationDiv.style.visibility = 'visible';

	const questions = fetchQuestions(QUESTIONS_URL);

	loadQuestion(questions, questionIdx);

	answerBt.addEventListener('click', async () =>
		{
			const status = isQuestionCorrect(questions, questionIdx);
			const feedback = document.querySelector("#feedback");
			status.then( value => {
				let goNext = true;

				if (value == -1)
				{
					goNext = false;
					return;
				}
				else if (value > 0)
				{
					score++;
					feedback.style.color = "green";
					feedback.textContent = "Correct";
				}
				else
				{
					feedback.style.color = "red";
					feedback.textContent = "Incorrect";
				}				
				if (!goNext)
					return;
				questionIdx++;
				loadQuestion(questions, questionIdx);
			});
			setTimeout(() => {
				feedback.textContent = '';
			}, 1000);
		}
	);
}

function showHelp()
{
	const help = document.createElement('p');
	const play = createPlayButton();

	QUESTIONS_CONTENT.innerHTML = '';

	help.textContent = "\
		You'll answer 10 random questions,\
		 at the end of the game your score will be displayed\
	";

	QUESTIONS_CONTENT.appendChild(help);
	QUESTIONS_CONTENT.appendChild(play);
	play.addEventListener('click', startGame);
}

//	helper functions
async function insertRandom(array, element)
{
	const randomIdx = Math.floor((Math.random() * (array.length + 1)));
	const tmp = array[randomIdx];
	array[randomIdx] = element;
	array.push(tmp);
}

function createPlayButton()
{
	const button = document.createElement('button');
	button.value = 'play';
	button.classList += 'init-button';
	button.id = 'play';
	button.textContent = "Play";
	return button;
}

function createHelpButton()
{
	const button = document.createElement('button');
	button.value = 'help';
	button.classList += 'init-button';
	button.textContent = "Help";
	button.id = 'help';
	return button;
}
