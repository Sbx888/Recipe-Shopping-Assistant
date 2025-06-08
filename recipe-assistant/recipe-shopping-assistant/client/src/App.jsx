import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [recipeUrl, setRecipeUrl] = useState('');
  const [recipe, setRecipe] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`/api/recipe?url=${encodeURIComponent(recipeUrl)}`);
      setRecipe(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1>Recipe Shopping Assistant</h1>
      
      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <div style={{ marginBottom: '10px' }}>
          <input
            type="text"
            value={recipeUrl}
            onChange={(e) => setRecipeUrl(e.target.value)}
            placeholder="Enter recipe URL"
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <button 
          type="submit" 
          disabled={loading}
          style={{ padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          {loading ? 'Loading...' : 'Get Recipe'}
        </button>
      </form>

      {error && (
        <div style={{ color: 'red', marginBottom: '20px' }}>
          Error: {error}
        </div>
      )};
      
      {recipe && (
        <div>
          <h2>{recipe.recipe.title}</h2>
          
          <h3>Ingredients:</h3>
          <ul>
            {recipe.recipe.ingredients.map((ingredient, index) => (
              <li key={index}>{ingredient}</li>
            ))}
          </ul>

          <h3>Method:</h3>
          <ol>
            {recipe.recipe.method.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>

          {recipe.shoppingList && (
            <>
              <h3>Shopping List:</h3>
              <ul>
                {recipe.shoppingList.map((item, index) => (
                  <li key={index}>
                    {item.ingredient}
                    {item.product && (
                      <div style={{ marginLeft: '20px', fontSize: '0.9em' }}>
                        Found: {item.product.name} - ${item.product.price}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default App; 