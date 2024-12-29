// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './components/Navigation';

// Routes principales
import Recipes from './pages/Recipes/Recipes';
import CreateRecipe from './pages/Recipes/CreateRecipe';
import RecipeDetail from './pages/Recipes/RecipeDetail';
import EditRecipe from './pages/Recipes/EditRecipe';

// Routes Configuration
import Config from './pages/Config/Config';
import Tags from './pages/Config/Tags';
import Ingredients from './pages/Config/Ingredients';

// Routes Planning
import Planning from './pages/Planning/Planning';
import Calendar from './pages/Planning/Calendar';
import ShoppingList from './pages/Planning/ShoppingList';

// Routes Notes
import Notes from './pages/Notes/Notes';
import RestaurantNotes from './pages/Notes/RestaurantNotes';
import RestaurantNoteDetail from './pages/Notes/RestaurantNoteDetail';
import EditRestaurantNote from './pages/Notes/EditRestaurantNote';
import Ideas from './pages/Notes/Ideas';
import IdeaDetail from './pages/Notes/IdeaDetail';
import EditIdea from './pages/Notes/EditIdea';

function App() {
 return (
   <Router>
     <div className="min-h-screen bg-gray-50">
       <Navigation />
       <main className="w-full">
         <div className="container mx-auto py-6">
           <Routes>
             {/* Route par défaut */}
             <Route path="/" element={<Navigate to="/recipes" replace />} />

             {/* Routes Recettes */}
             <Route path="/recipes" element={<Recipes />} />
             <Route path="/recipes/create" element={<CreateRecipe />} />
             <Route path="/recipes/:id/edit" element={<EditRecipe />} />
             <Route path="/recipes/:id" element={<RecipeDetail />} />
             
             {/* Routes Configuration */}
             <Route path="/config" element={<Config />}>
               <Route index element={<Navigate to="/config/tags" replace />} />
               <Route path="tags" element={<Tags />} />
               <Route path="ingredients" element={<Ingredients />} />
             </Route>

             {/* Routes Planning */}
             <Route path="/planning" element={<Planning />}>
               <Route index element={<Navigate to="/planning/calendar" replace />} />
               <Route path="calendar" element={<Calendar />} />
               <Route path="shopping-list" element={<ShoppingList />} />
             </Route>

             {/* Routes Notes */}
             <Route path="/notes" element={<Notes />}>
               <Route index element={<Navigate to="/notes/restaurants" replace />} />
               <Route path="restaurants" element={<RestaurantNotes />} />
               <Route path="restaurants/:id" element={<RestaurantNoteDetail />} />
               <Route path="restaurants/:id/edit" element={<EditRestaurantNote />} />
               <Route path="ideas" element={<Ideas />} />
               <Route path="ideas/:id" element={<IdeaDetail />} />
               <Route path="ideas/:id/edit" element={<EditIdea />} />
             </Route>
           </Routes>
         </div>
       </main>
     </div>
   </Router>
 );
}

export default App;