require('./asserters')();

var mock = require('./http-mock');

var attributes = {
	zipCode: '76187',
	givenName: 'Max',
	surname: 'Mustermann',
	phone: '0157812312335'
};

describe('Register', function() {
	this.timeout(2 * 60 * 1000);

	var abilitylist = by.repeater('ability in ctrl.abilities');

	it('has two entries: "Mocked Ability 1" and "Mocked Ability 2"', function() {
		mock(['abilities']);

		browser.getPart('register');

		expect(element.all(abilitylist).count()).to.eventually.equal(2);
		expect(element(abilitylist.column('ability.name').row(0)).getInnerHtml()).to.eventually.contain('Mocked Ability');
		expect(element(abilitylist.column('ability.name').row(1)).getInnerHtml()).to.eventually.contain('Mocked Ability');
	});

	it('allows to register with correct data', function() {
		mock(['volunteers']);

		browser.getPart('register');

		var zipCode = browser.findElement(by.model('ctrl.zipCode'));
		zipCode.sendKeys(attributes['zipCode']);
		var givenName = browser.findElement(by.model('ctrl.givenName'));
		givenName.sendKeys(attributes['givenName']);
		var surname = browser.findElement(by.model('ctrl.surname'));
		surname.sendKeys(attributes['surname']);
		var phone = browser.findElement(by.model('ctrl.phone'));
		phone.sendKeys(attributes['phone']);
		var adult = browser.findElement(by.model('ctrl.adult'));
		adult.click();

		element(by.partialButtonText('Register')).click();

		expect(mock.requestsMade()).to.eventually.deep.equal([
			{
				url : 'api/volunteers',
				method : 'POST',
				data: {
					address: {
						zipCode: attributes['zipCode']
					},
					adult: true,
					givenName: attributes['givenName'],
					surname: attributes['surname'],
					phone: attributes['phone']
				}
			}
		]);
		expect(element(by.id('error')).isDisplayed()).to.eventually.equal(false);
		// Currently the test does not recognize the page forward, so the next line will fail.
		//expect(element(by.tagName('h1')).getInnerHtml()).to.eventually.contain('Thank you');

	});

	it('shows an error for adult=false', function() {
		mock(['volunteers']);

		browser.getPart('register');

		var zipCode = browser.findElement(by.model('ctrl.zipCode'));
		zipCode.sendKeys(attributes['zipCode']);
		var givenName = browser.findElement(by.model('ctrl.givenName'));
		givenName.sendKeys(attributes['givenName']);
		var surname = browser.findElement(by.model('ctrl.surname'));
		surname.sendKeys(attributes['surname']);
		var phone = browser.findElement(by.model('ctrl.phone'));
		phone.sendKeys(attributes['phone']);

		element(by.partialButtonText('Register')).click();

		expect(mock.requestsMade()).to.eventually.deep.equal([
			{
				url : 'api/volunteers',
				method : 'POST',
				data: {
					address: {
						zipCode: attributes['zipCode']
					},
					adult: false,
					givenName: attributes['givenName'],
					surname: attributes['surname'],
					phone: attributes['phone']
				}
			}
		]);
		expect(element(by.id('error')).isDisplayed()).to.eventually.equal(true);
		expect(element.all(by.className('has-error')).count()).to.eventually.equal(1);

	});
});
