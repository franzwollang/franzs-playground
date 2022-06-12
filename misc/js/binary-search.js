// find specific a word in a large list of sorted words

// naive approach: go through the words one by one until you find the word your looking for. On average, this will take you looking through 1/2 of the list of words. Complexity is o(n).

// better approach: take advantage of the fact that the list is sorted. Take the word that is "in the middle" of the list (cutting it in half), check if the word you're looking for would go before or after this word in sort order. Then take that half of the list, find "the middle word" of that half (cutting it in half again), repeat the process... until you find your word. The complexity is o(log(n)).

export function find(sortedList, query) {
	const left = -1;
	const right = 1;

	let queryLocated = false;
	let direction = 0;
	let pointer = Math.ceil(sortedList.length / 2) - 1;
	let setSize = sortedList.length;

	if (setSize == 1) {
		if (sortedList[0] == query) {
			return 0;
		} else {
			null;
		}
	}

	while (!queryLocated && setSize >= 1) {
		const middleElement = sortedList[pointer];
		console.log("middleElement: ", middleElement);

		if (query == middleElement) {
			queryLocated = true;
		} else if (setSize == 1) {
			break;
		} else {
			if (query < middleElement) {
				direction = left;
				setSize = Math.floor(setSize / 2) + (setSize % 2);
			} else {
				direction = right;
				setSize = Math.floor(setSize / 2);
			}
			console.log("direction: ", direction);
			console.log("setSize: ", setSize);
			pointer =
				pointer + direction * (Math.floor(setSize / 2) + (setSize % 2));
		}
	}

	console.log("pointer: ", pointer);

	if (!queryLocated) {
		throw new Error("Value not in array");
	}

	return pointer;
}
