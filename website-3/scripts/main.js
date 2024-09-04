//	https://opentdb.com/api_config.php

main();

function main()
{
	//	API parameters
	const AMOUNT			= 10;
	const QUESTIONS_URL		= `https://opentdb.com/api.php?amount=${AMOUNT}`;

	if (AMOUNT <= 0 || !QUESTIONS_URL)
		throw new Error("Invalid API parameters");

	//	HTML elements
	const FEEDBACK_DIV		= document.querySelector("#feedback")
	const NAVIGATION_DIV	= document.querySelector("#navigation");
	const QUESTIONS_CONTENT	= document.querySelector("#question-content");
	const BUTTONS			= {
		buttons: document.querySelectorAll(".action-button, .init-button"),
		get answerBt() { return this.buttons[2]; },
		get resetBt() { return this.buttons[3]; },
		get playBt() { return this.buttons[0]; },
		get helpBt() { return this.buttons[1]; },
	};
	
	if (!QUESTIONS_CONTENT || !FEEDBACK_DIV || !NAVIGATION_DIV)
		throw new Error("Missing/invalid HTML structure");
	for (const button of BUTTONS.buttons)
	{
		if (!button)
			throw new Error("Missing/invalid HTML structure");
	}

	//	weird closure behavior
	let	hasEventListener = false;

	async function startGame()
	{
		hasEventListener = true;

		let questionIdx = 0;
		let score = 0;
		NAVIGATION_DIV.style.visibility = 'hidden';
		QUESTIONS_CONTENT.innerHTML = '';
		
		FEEDBACK_DIV.textContent = "LOADING...";
		const questions = await fetchQuestions(QUESTIONS_URL);
		FEEDBACK_DIV.textContent = "";

		loadQuestion(questions, questionIdx);

		NAVIGATION_DIV.style.visibility = 'visible';
		console.log(questions.results);

		BUTTONS.answerBt.addEventListener('click', answerHandler);

		function loadQuestion(questions, index)
		{
			QUESTIONS_CONTENT.innerHTML = '';

			questions.results[index].incorrect_answers.push(questions.results[index].correct_answer);
			shuffleArray(questions.results[index].incorrect_answers);

			const question = document.createElement('legend');
			const tmpSpan = document.createElement('span');
			tmpSpan.innerHTML = questions.results[index].question;
			question.textContent = tmpSpan.textContent;
			const choice_labels = [];

			QUESTIONS_CONTENT.appendChild(question);
			for (let i = 0; i < questions.results[index].incorrect_answers.length; i++)
			{
				tmpSpan.innerHTML = questions.results[index].incorrect_answers[i];
				const sanitized_value = tmpSpan.textContent;
				const choice = document.createElement('input');

				choice.type="radio";
				choice.name="choice";
				choice.value = sanitized_value;
				
				choice_labels.push(document.createElement('label'));
				choice_labels[i].appendChild(choice);
				choice_labels[i].appendChild(document.createTextNode(sanitized_value));

				QUESTIONS_CONTENT.appendChild(choice_labels[i]);
			}
		}

		async function answerHandler()
		{
			const CHOICES_LABEL = QUESTIONS_CONTENT.querySelectorAll('label');
			const CHOICES_INPUT = QUESTIONS_CONTENT.querySelectorAll('label input');

			let emptyAnswer = true;
			for (const choice of CHOICES_INPUT)
			{
				if (choice.checked)
					emptyAnswer = false;
			}
			if (emptyAnswer)
				return ;

			for (const choice of CHOICES_INPUT)
			{
				if (choice.checked)
				{
					let feedback_color = 'green';
					let feedback_content = 'Correct';

					if (choice.value === questions.results[questionIdx].correct_answer)
						score++;
					else
					{
						feedback_content = 'Incorrect';
						feedback_color = 'red';
					}

					FEEDBACK_DIV.style.color = feedback_color;
					FEEDBACK_DIV.textContent = '';
					FEEDBACK_DIV.textContent = feedback_content;

					//	empty feedback field
					setTimeout(() => {
						FEEDBACK_DIV.textContent = '';
					}, 1000);

					break;
				}
			}

			questionIdx++;
			if (questionIdx >= AMOUNT)
			{
				questionIdx = 0;
				showGameOver(score);
				return;
			}
			loadQuestion(questions, questionIdx);
		}
	}

	function throttledStartGame(startGame, ms = 3000)
	{
		let timer = null;

		return function(...args) {
			if (timer === null)
			{
				startGame(...args);
				timer = setTimeout(() => {timer = null}, ms);
			}
		};
	}
	
	function initialSetup()
	{
		let throttleStart = throttledStartGame(startGame, 3000);

		BUTTONS.resetBt.addEventListener('click',() => {
			const input = confirm("Are you sure you want to reset the game (points will be lost).");
			if (input)
				startGame();
		});
		BUTTONS.playBt.addEventListener('click', throttleStart);
		BUTTONS.helpBt.addEventListener('click', showHelp);
	}

	function showHelp()
	{
		QUESTIONS_CONTENT.innerHTML = '';

		const helpMessage = document.createElement('p');
		helpMessage.textContent = `You'll answer ${AMOUNT} questions, at the end you'll score will appear.`;
		QUESTIONS_CONTENT.appendChild(helpMessage);
		QUESTIONS_CONTENT.appendChild(BUTTONS.playBt);
	}

	function showGameOver(score)
	{
		QUESTIONS_CONTENT.innerHTML = '';
		NAVIGATION_DIV.style.visibility = 'hidden';
		const message = document.createElement('p');
		message.textContent = `Your final score ${score}`;

		QUESTIONS_CONTENT.appendChild(message);
		QUESTIONS_CONTENT.appendChild(BUTTONS.playBt);
	}

	initialSetup();
}

//	fetch questions from API passed in URL (retry up to 10 times)
async function fetchQuestions(URL, MAX_RETRIES = 10, RETRY_INTERVAL = 3000)
{
	if (MAX_RETRIES > 10)
		throw new Error("MAX_RETRIES is too high");
	if (MAX_RETRIES <= 0)
		throw new Error("Could not fetch questions :/");
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
		console.log(`fetch failed with error ${error}, retrying....`);
		const delay = new Promise(resolve => setTimeout(resolve, RETRY_INTERVAL));
		await delay;
		return fetchQuestions(URL, MAX_RETRIES - 1, RETRY_INTERVAL + 300);
	}
}

//	helper functions
//	https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffleArray(array)
{
	let i = array.length;

	while (i != 0)
	{
		const random = Math.floor(Math.random() * i);
		i--;

		[array[i], array[random]] = [array[random], array[i]];

	}
}