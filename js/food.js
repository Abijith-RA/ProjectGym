document.addEventListener('DOMContentLoaded', async () => {
  const foodList = document.getElementById('food-list');
  
  try {
    // Show loading state
    foodList.innerHTML = createLoadingSkeleton(3);
    
    // 1. First check Supabase connection
    if (!window.supabase) {
      throw new Error('Supabase client not initialized');
    }

    // 2. Fetch food items with timeout
    const fetchPromise = supabase
      .from('food_item')
      .select(`
        id,
        name,
        description,
        price,
        category,
        calories,
        protein,
        carbs,
        fats,
        image_url,
        is_featured
      `)
      .order('created_at', { ascending: false });

    // Add 5-second timeout
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), 5000)
    );

    const { data: foodItems, error } = await Promise.race([fetchPromise, timeoutPromise]);

    // 3. Handle potential Supabase error
    if (error) {
      console.error('Supabase error:', error);
      throw new Error('Database connection error');
    }

    // 4. Check if data exists
    if (!foodItems || foodItems.length === 0) {
      foodList.innerHTML = createEmptyState();
      return;
    }

    // 5. Display food items
    foodList.innerHTML = '';
    foodItems.forEach((item, index) => {
      const card = createFoodItemCard(item);
      // Add delay for staggered animation
      card.style.animationDelay = `${index * 0.1}s`;
      foodList.appendChild(card);
    });

    // 6. Add event listeners to buttons
    document.querySelectorAll('.food-item button').forEach(button => {
      button.addEventListener('click', function() {
        const foodId = this.getAttribute('data-id');
        addToCart(foodId);
      });
    });

  } catch (error) {
    console.error('Error loading food items:', error);
    foodList.innerHTML = createErrorState(error.message);
    
    // Show additional debug info in console
    debugDatabaseConnection();
  }
});

// Improved error state with specific messages
function createErrorState(message = 'Failed to load menu') {
  return `
    <div class="error-state">
      <i class="fas fa-exclamation-triangle"></i>
      <p>${message}</p>
      <small class="debug-info" style="display:none">
        Check console for more details
      </small>
      <button class="retry-btn">Retry</button>
    </div>
  `;
}

// Debug function
async function debugDatabaseConnection() {
  try {
    console.group('Database Connection Debug');
    
    // 1. Check if Supabase is initialized
    console.log('Supabase initialized:', !!window.supabase);
    
    if (window.supabase) {
      // 2. Test a simple query
      const { data, error } = await supabase
        .from('food_item')
        .select('id')
        .limit(1);
      
      console.log('Test query results:', { data, error });
      
      // 3. Check table existence
      const { data: tables } = await supabase
        .rpc('get_table_names');
      
      console.log('Available tables:', tables);
    }
    
    console.groupEnd();
  } catch (debugError) {
    console.error('Debug failed:', debugError);
  }
}

// Add retry functionality
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('retry-btn')) {
    location.reload();
  }
});

// Rest of your helper functions remain the same...
function createFoodItemCard(item) {
  const card = document.createElement('div');
  card.className = `food-item ${item.is_featured ? 'featured' : ''}`;
  card.innerHTML = `
    <div class="food-image-container">
      <img src="${item.image_url || 'https://via.placeholder.com/300x200?text=FuelBox'}" 
           alt="${item.name}"
           onerror="this.src='https://via.placeholder.com/300x200?text=Meal'">
      ${item.is_featured ? '<span class="featured-badge">Featured</span>' : ''}
    </div>
    <div class="food-info">
      <h3>${item.name}</h3>
      <p class="category">${item.category || 'Nutrition'}</p>
      <p class="description">${item.description || 'Premium gym nutrition meal'}</p>
      
      <div class="nutrition-facts">
        <span><i class="fas fa-fire"></i> ${item.calories || '--'} cal</span>
        <span><i class="fas fa-dumbbell"></i> ${item.protein || '--'}g protein</span>
      </div>
      
      <div class="food-footer">
        <span class="price">$${item.price?.toFixed(2) || '0.00'}</span>
        <button data-id="${item.id}">
          <i class="fas fa-cart-plus"></i> Add
        </button>
      </div>
    </div>
  `;
  return card;
}

function createLoadingSkeleton(count) {
  return Array(count).fill(`
    <div class="food-item loading">
      <div class="food-img-placeholder"></div>
      <div class="food-info">
        <h3></h3>
        <p></p>
        <div class="food-footer">
          <span class="price"></span>
          <button disabled></button>
        </div>
      </div>
    </div>
  `).join('');
}

function createEmptyState() {
  return `
    <div class="empty-state">
      <i class="fas fa-utensils"></i>
      <p>No meal plans available at the moment</p>
    </div>
  `;
}