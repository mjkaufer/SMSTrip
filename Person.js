var Person = function(number){
	this.number = number;
	this.directionIndex = 0;
	this.steps = [];
	this.start = null;
	this.end = null;
	this.started = false;

}

Person.prototype.reset = function(){
	this.directionIndex = 0;
	this.steps = [];
	this.start = null;
	this.end = null;
	this.started = false;
	return true;
}

Person.prototype.getSteps = function(){
	if(!this.steps[0])
		return false

	return this.steps[0].steps
}

Person.prototype.currentStep = function(){
	return formatHTMLInstructions(this.getSteps()[this.directionIndex].html_instructions);
}

function formatHTMLInstructions(html){
	return html.replace(/<\/?b>/g,"")
}

module.exports = Person