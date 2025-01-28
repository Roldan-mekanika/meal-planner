// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { PlanningProvider } from './contexts/PlanningContext';
import RequireAuth from './components/auth/RequireAuth';
import Navigation from './components/Navigation';

// Routes Auth
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';

// Routes Recipes
import Recipes from './pages/Recipes/Recipes';
import CreateRecipe from './pages/Recipes/CreateRecipe';
import RecipeDetail from './pages/Recipes/RecipeDetail';
import EditRecipe from './pages/Recipes/EditRecipe';

// Routes Config
import Config from './pages/Config/Config';
import Tags from './pages/Config/Tags';
import TagCategoryManager from './components/config/TagCategoryManager';
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
   <AuthProvider>
     <PlanningProvider>
       <Router>
         <Routes>
           {/* Routes Publiques */}
           <Route path="/login" element={<Login />} />
           <Route path="/signup" element={<Signup />} />

           {/* Routes Protégées */}
           <Route path="/" element={
             <RequireAuth>
               <div className="min-h-screen bg-sage-50">
                 <Navigation />
                 <main className="w-full">
                   <div className="container mx-auto py-6">
                     <Outlet />
                   </div>
                 </main>
               </div>
             </RequireAuth>
           }>
             <Route index element={<Navigate to="/recipes" replace />} />
             <Route path="recipes" element={<Recipes />} />
             <Route path="recipes/create" element={<CreateRecipe />} />
             <Route path="recipes/:id/edit" element={<EditRecipe />} />
             <Route path="recipes/:id" element={<RecipeDetail />} />

             <Route path="config" element={<Config />}>
               <Route index element={<Navigate to="/config/tag-categories" replace />} />
               <Route path="tag-categories" element={<TagCategoryManager />} />
               <Route path="tags" element={<Tags />} />
               <Route path="ingredients" element={<Ingredients />} />
             </Route>

             <Route path="planning" element={<Planning />}>
               <Route index element={<Navigate to="/planning/calendar" replace />} />
               <Route path="calendar" element={<Calendar />} />
               <Route path="shopping-list" element={<ShoppingList />} />
             </Route>

             <Route path="notes" element={<Notes />}>
               <Route index element={<Navigate to="/notes/restaurants" replace />} />
               <Route path="restaurants" element={<RestaurantNotes />} />
               <Route path="restaurants/:id" element={<RestaurantNoteDetail />} />
               <Route path="restaurants/:id/edit" element={<EditRestaurantNote />} />
               <Route path="ideas" element={<Ideas />} />
               <Route path="ideas/:id" element={<IdeaDetail />} />
               <Route path="ideas/:id/edit" element={<EditIdea />} />
             </Route>
           </Route>
         </Routes>
       </Router>
     </PlanningProvider>
   </AuthProvider>
 );
}

export default App;