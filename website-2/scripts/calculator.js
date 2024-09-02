const INPUT_FIELD = document.querySelector("#input_field");
const NUM_KEYS = document.querySelectorAll(".numeric-key");
const OPERATOR_KEYS = document.querySelectorAll(".operator-key");

setEventListeners();

function setEventListeners()
{
	for (const numkey of NUM_KEYS)
	{
		numkey.addEventListener("click", addToInput);
	}

	for (const operator of OPERATOR_KEYS)
	{
		operator.addEventListener("click", addToInput);
	}

	document.querySelector(".dot-key").addEventListener("click", addToInput);
	document.querySelector(".del-key").addEventListener("click", deleteInput);
	document.querySelector(".equals-key").addEventListener("click", parseInput);
	document.querySelector(".reset-key").addEventListener("click", clearInput);
}


//	event handlers;
function parseInput()
{
	let result = 0;

	if (!INPUT_FIELD.value || INPUT_FIELD.value === "")
		return;
	
	INPUT_FIELD.value = INPUT_FIELD.value.replaceAll(" ", "");
	let full_input = INPUT_FIELD.value.split(/([\*\+\-\/])/);

	for (i = 0; full_input && full_input.length && i < full_input.length; i++)
	{
		if (!full_input[i].length)
		{
		
			console.log(full_input[i]);
			full_input.splice(i, 1);
			i--;
			
		}
	}

	if (!full_input || full_input.length < 3)
		return;

	for (i = 0; full_input && full_input[i] && i < full_input.length; i++)
	{
		if (is_operator(full_input[i]))
		{
			if (invalid_operator(full_input[i - 1], full_input[i + 1]))
			{
				full_input.splice(i, 1);
				i--;
			}
			else if ((i == 0 || is_operator(full_input[i - 1])) && !is_operator(full_input[i + 1]))
			{	
				full_input[i] += full_input[i + 1];
				full_input.splice(i + 1, 1);
			}
		}
	}

	if (!full_input || full_input.length < 3)
		return;

	for (i = 0; i < full_input.length; i += 3)
	{
		if (full_input[i + 1] === "+")
			result += Number(full_input[i]) + Number(full_input[i + 2]);
		else if (full_input[i + 1] === "-")
			result += Number(full_input[i]) - Number(full_input[i + 2]);
		else if (full_input[i + 1] === "*")
			result += Number(full_input[i]) * Number(full_input[i + 2]);
		else if (full_input[i + 1] === "/")
			result += Number(full_input[i]) / Number(full_input[i + 2]);
	}

	INPUT_FIELD.value = result;

	//	helper functions;
	function is_operator(char)
	{
		const operators = "*-/+";

		if (!char)
			return false;
		return (operators.includes(char));
	}
	function invalid_operator(prev, next)
	{
		if (!next)
			return true;
		else if (!prev && is_operator(next))
			return true;
		else if (is_operator(prev) && is_operator(next))
			return true;
		return false;
	}
}

function addToInput(e)
{
	const LENGTH = INPUT_FIELD.value.length + e.target.innerText.length;
	INPUT_FIELD.value += e.target.innerText;
	INPUT_FIELD.setSelectionRange(LENGTH, LENGTH);
	INPUT_FIELD.scrollLeft = INPUT_FIELD.scrollWidth;
}

function deleteInput()
{
	INPUT_FIELD.value = INPUT_FIELD.value.slice(0, -1);
}

function clearInput()
{
	INPUT_FIELD.value = "";
}
