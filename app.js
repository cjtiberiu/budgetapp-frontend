
// BUDGET CONTROLLER
var budgetController = (function() {

	var Income = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
	};

	var Expense = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
		this.percentage = -1;
	};

	Expense.prototype.calcPercentage = function(totalIncome) {

		if (totalIncome > 0) {

			this.percentage = Math.round((this.value / totalIncome) * 100);

		} else {

			this.percentage = -1;
		}

	};

	Expense.prototype.getPercentage = function() {

		return this.percentage; 
	};

	var calculateTotal = function(type) {

		var sum = 0;

		data.allItems[type].forEach(function(current) {

			sum += current.value;
		});

		data.totals[type] = sum;
	};

	var data = {
		allItems: {
			inc: [],
			exp: []
		},
		totals: {
			inc: 0,
			exp: 0
		},
		budget: 0,
		percentage: -1
		
	};

	return {
		addItem: function(type, des, val) {
			var newItem, ID;

			if (data.allItems[type].length > 0) {

				ID = data.allItems[type][data.allItems[type].length - 1].id + 1;

			} else {

				ID = 0;
			}

			if (type === "inc") {

				newItem = new Income(ID, des, val);

			} else if (type === "exp") {

				newItem = new Expense(ID, des, val);

			}

			data.allItems[type].push(newItem);

			console.log(newItem);

			return newItem;

		},

		calculateBudget: function() {

			// Calculate total income and expenses

			calculateTotal('inc');
			calculateTotal('exp');

			// Calculate the budget: income - expenses

			data.budget = data.totals.inc - data.totals.exp;

			// Calculate the percentage of expense that we spent

			if (data.totals.inc > data.totals.exp) {

				data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);

			};


		},


		calculatePercentages: function() {

			data.allItems.exp.forEach(function(current) {

				current.calcPercentage(data.totals.inc);
			});

		},


		getPercentages: function() {

			var allPerc = data.allItems.exp.map(function(current) {

				return current.getPercentage();
			})

			return allPerc;
		},



		getBudget: function() {

			return {
				budget: data.budget,
				totalInc: data.totals.inc,
				totalExp: data.totals.exp,
				percentage: data.percentage
			};
		},

		deleteItem: function(type, id) {
			var ids, index;

			ids = data.allItems[type].map(function(current) {

				return current.id;
			});

			index = ids.indexOf(id);

			if (index !== -1) {

				data.allItems[type].splice(index, 1);
			}
		},


	};

})();




// UI CONTROLLER
var UIController = (function() {

	var DOMstrings = {
		inputType: ".add__type",
		inputDescription: ".add__description",
		inputValue: ".add__value",
		inputButton: ".add__btn",
		budget: ".budget__value",
		budgetIncome: ".budget__income--value",
		budgetExpenses: ".budget__expenses--value",
		expensePercentage: ".budget__expenses--percentage",
		container: ".container",
		itemPercentage: ".item__percentage",
		dateLabel: ".budget__title--month"
	};


	// IMPORTANT ; DE REFOLOSIT

	var nodeListForEach = function(list, callback) {

				for (var i = 0; i < list.length; i++) {

					callback(list[i], i);
				}

			};


	var formatNumber = function(num, type) {
			var numSplit, int, dec;

			// + or - before the number
			// exacly 2 decimal points
			// comma separating the thousands

			num = Math.abs(num);
			num = num.toFixed(2);

			numSplit = num.split('.');

			int = numSplit[0];
			
			if (int.length > 3) {

				int = int.substr(0, int.length - 3) + "," + int.substr(int.length - 3, 3);
			}

			dec = numSplit[1];

			type === 'exp' ? sign = '-' : sign = '+';

			return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;

	};

	return {

		getInput: function() {
			return {

				type: document.querySelector(DOMstrings.inputType).value,
				description: document.querySelector(DOMstrings.inputDescription).value,
				value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
			};
		},

		addListItem: function(obj, type) {
			var html, newHTML;

			if (type === "inc") {

				html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value"> %value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';

				var lists = document.querySelector('.income__list');

			} else if (type === "exp") {

				html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value"> %value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';

				var lists = document.querySelector('.expenses__list');

			}



				newHTML = html.replace("%id%", obj.id);
				newHTML = newHTML.replace("%description%", obj.description);
				newHTML = newHTML.replace("%value%", formatNumber(obj.value, type));
				lists.insertAdjacentHTML("beforeend", newHTML);

		},

		deleteListItem: function(selectorID) {

			el = document.getElementById(selectorID);
			el.parentNode.removeChild(el);
		},

		clearFields: function() {
			var fields;

			fields = document.querySelectorAll(DOMstrings.inputDescription + ", " + DOMstrings.inputValue);

			var fieldsArr = Array.prototype.slice.call(fields);

			fieldsArr.forEach(function(current, index, array) {

				current.value = "";
				fieldsArr[0].focus();
			});

		},

		getDOMstrings: function() {
			return DOMstrings;
		},

		displayBudget: function(obj) {

			var type;

			obj.budget > 0 ? type = 'inc' : type = 'exp';
			
			document.querySelector(DOMstrings.budget).textContent = formatNumber(obj.budget, type);
			document.querySelector(DOMstrings.budgetIncome).textContent = formatNumber(obj.totalInc, 'inc');
			document.querySelector(DOMstrings.budgetExpenses).textContent = formatNumber(obj.totalExp, 'exp');

			if (obj.totalInc > 0) {
				document.querySelector(DOMstrings.expensePercentage).textContent = obj.percentage + "%";

			} else {
				document.querySelector(DOMstrings.expensePercentage).textContent = '---';
			}

		},


		displayDate: function() {

			var date = new Date();

			var year = date.getFullYear();

			var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'September', 'Octomber', 'November', 'December'];

			var month = date.getMonth();

			document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year; 
		},


		changedType: function() {
			var fields, button;

			fields = document.querySelectorAll(DOMstrings.inputType + ',' + DOMstrings.inputDescription + ',' + DOMstrings.inputValue);

			button = document.querySelector(DOMstrings.inputButton);

			nodeListForEach(fields, function(current) {

				current.classList.toggle('red-focus');
			});

			button.classList.toggle('red');

		},


		displayPercentages: function(percentages) {
			var fields;

			fields = document.querySelectorAll(DOMstrings.itemPercentage);

			// IMPORTANT ; DE REFOLOSIT

			nodeListForEach(fields, function(current, index) {

				if (percentages[index] > 0) {

					current.textContent = percentages[index] + "%";
				} else {

					current.textContent = '---';
				}
			});
			
		}	

	};

})();




//GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl) {

	var setEventListeners = function() {

		var DOM = UICtrl.getDOMstrings();

		document.querySelector(DOM.inputButton).addEventListener('click', ctrAddItem);

		document.addEventListener('keypress', function(event) {

			if (event.keyCode === 13) {

				ctrAddItem();
			}
		});

		document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

		document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
	};

	var updateBudget = function() {

		// 1. Calculate de budget

		budgetCtrl.calculateBudget();

		// 2. Return the budget

		var budget = budgetCtrl.getBudget();

		// 3. Display the budget on the UI

		var displayBudget = UICtrl.displayBudget(budget);
	};



	var updatePercentages = function() {

		// 1. Calculate percentages

		budgetCtrl.calculatePercentages();

		// 2. Read from the budget controller

		var percentages = budgetCtrl.getPercentages();

		// 3. Update the UI

		var displayPercentages = UICtrl.displayPercentages(percentages);
	};



	var ctrAddItem = function() {

		// 1. Get the field input data

		var input = UICtrl.getInput();

		if (input.description !== "" && !isNaN(input.value) && input.value > 0) {

			// 2. Add the item to the budget Controller

			var newItem = budgetCtrl.addItem(input.type, input.description, input.value);

			// 3. Add the item to the UI Controller

			var displayItem = UICtrl.addListItem(newItem, input.type); 

			// 4. Clear the fields

			UICtrl.clearFields();

			// 5. Calculate the budget

			updateBudget();

			// 6. Display the budget


			updatePercentages();


	 	};

	};

	var ctrlDeleteItem = function(event) {
		var itemID, splitID, type, ID;

		itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

		if (itemID) {

			splitID = itemID.split('-');
			type = splitID[0];
			ID = parseInt(splitID[1]);

			budgetCtrl.deleteItem(type, ID);

			UICtrl.deleteListItem(itemID);

			updateBudget();

			updatePercentages();

		}
	};

	return {

		init: function() {

			UICtrl.displayDate();

			UICtrl.displayBudget({
				budget: 0,
				totalInc: 0,
				totalExp: 0,
				percentage: -1
			});

			setEventListeners();
			console.log('App has started!');
		}
	}

	

})(budgetController, UIController);

controller.init();








