//	https://opentdb.com/api_config.php
const questionContent = document.querySelector("#question-content");

function getQuestions()
{
	return fetch('https://opentdb.com/api.php?amount=10')
	.then( response => {
		if (!response.ok)
			throw new Error("Error while fetching, status: " + response.status);
		return response.json();
	})
	.then (data => {
		console.log(data);
		return (data);
	})
	.catch (error => {
		console.error(`failed to get quizzes: ${error}`);
	});
}
const json = getQuestions().then((data) => {return data;});

console.log(json);


//	helper functions
function insertRandom(array, element)
{
	const randomIdx = Math.floor(Math.random() * (array.lenght + 1));

	array.splice(randomIdx, 0, element);
}

function createOption(str)
{
	const label = document.createElement('label');
	const input = document.createElement('input');

	input.type = 'radio';
	input.name = 'options';
	input.value = str;
	label.appendChild(input);
	label.innerHTML += str;
	return label;
}