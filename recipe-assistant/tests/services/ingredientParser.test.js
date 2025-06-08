const { expect } = require('chai');
const ingredientParser = require('../../services/ingredientParser');

describe('Ingredient Parser Service', () => {
  describe('parse()', () => {
    it('should parse basic ingredients with quantity and unit', async () => {
      const result = await ingredientParser.parse('2 cups flour');
      expect(result).to.deep.equal({
        ingredient: 'flour',
        quantity: 2,
        unit: 'cup',
        original: '2 cups flour'
      });
    });

    it('should parse fractional quantities', async () => {
      const result = await ingredientParser.parse('1/2 cup sugar');
      expect(result).to.deep.equal({
        ingredient: 'sugar',
        quantity: 0.5,
        unit: 'cup',
        original: '1/2 cup sugar'
      });
    });

    it('should parse mixed number quantities', async () => {
      const result = await ingredientParser.parse('1 1/2 cups milk');
      expect(result).to.deep.equal({
        ingredient: 'milk',
        quantity: 1.5,
        unit: 'cup',
        original: '1 1/2 cups milk'
      });
    });

    it('should handle ingredients without quantities', async () => {
      const result = await ingredientParser.parse('salt to taste');
      expect(result).to.deep.equal({
        ingredient: 'salt',
        quantity: null,
        unit: null,
        original: 'salt to taste'
      });
    });

    it('should normalize common unit variations', async () => {
      const tests = [
        ['2 tablespoons sugar', 'tbsp'],
        ['3 teaspoons salt', 'tsp'],
        ['1 pound beef', 'lb'],
        ['500 grams flour', 'g'],
        ['1 liter milk', 'l'],
        ['2 ounces chocolate', 'oz']
      ];

      for (const [input, expectedUnit] of tests) {
        const result = await ingredientParser.parse(input);
        expect(result.unit).to.equal(expectedUnit);
      }
    });

    it('should handle ranges and approximate quantities', async () => {
      const result = await ingredientParser.parse('2-3 tablespoons olive oil');
      expect(result).to.deep.equal({
        ingredient: 'olive oil',
        quantity: 2.5, // Takes average of range
        unit: 'tbsp',
        original: '2-3 tablespoons olive oil'
      });
    });

    it('should handle ingredients with descriptions', async () => {
      const result = await ingredientParser.parse('2 large eggs, beaten');
      expect(result).to.deep.equal({
        ingredient: 'eggs',
        quantity: 2,
        unit: 'piece',
        original: '2 large eggs, beaten',
        notes: 'large, beaten'
      });
    });

    it('should handle ingredients with parenthetical notes', async () => {
      const result = await ingredientParser.parse('1 cup rice (uncooked)');
      expect(result).to.deep.equal({
        ingredient: 'rice',
        quantity: 1,
        unit: 'cup',
        original: '1 cup rice (uncooked)',
        notes: 'uncooked'
      });
    });

    it('should normalize ingredient names', async () => {
      const tests = [
        ['all purpose flour', 'flour'],
        ['granulated sugar', 'sugar'],
        ['extra virgin olive oil', 'olive oil'],
        ['kosher salt', 'salt'],
        ['large yellow onion', 'onion']
      ];

      for (const [input, expectedName] of tests) {
        const result = await ingredientParser.parse(`1 cup ${input}`);
        expect(result.ingredient).to.equal(expectedName);
      }
    });

    it('should handle metric to imperial conversions', async () => {
      const result = await ingredientParser.parse('500g flour', 'imperial');
      expect(result).to.deep.equal({
        ingredient: 'flour',
        quantity: 17.637, // 500g = 17.637oz
        unit: 'oz',
        original: '500g flour'
      });
    });

    it('should handle imperial to metric conversions', async () => {
      const result = await ingredientParser.parse('1 pound flour', 'metric');
      expect(result).to.deep.equal({
        ingredient: 'flour',
        quantity: 453.592, // 1lb = 453.592g
        unit: 'g',
        original: '1 pound flour'
      });
    });
  });
});

describe('Ingredient Parser Error Handling', () => {
  it('should handle empty input', async () => {
    const result = await ingredientParser.parse('');
    expect(result).to.deep.equal({
      ingredient: '',
      quantity: null,
      unit: null,
      original: ''
    });
  });

  it('should handle invalid fractions', async () => {
    const result = await ingredientParser.parse('1/0 cup flour');
    expect(result).to.deep.equal({
      ingredient: 'flour',
      quantity: null,
      unit: 'cup',
      original: '1/0 cup flour',
      error: 'Invalid fraction'
    });
  });

  it('should handle unknown units gracefully', async () => {
    const result = await ingredientParser.parse('1 bucket water');
    expect(result).to.deep.equal({
      ingredient: 'water',
      quantity: 1,
      unit: 'bucket', // Preserves unknown unit
      original: '1 bucket water'
    });
  });

  it('should handle malformed input', async () => {
    const result = await ingredientParser.parse('!!!');
    expect(result).to.deep.equal({
      ingredient: '!!!',
      quantity: null,
      unit: null,
      original: '!!!'
    });
  });
}); 