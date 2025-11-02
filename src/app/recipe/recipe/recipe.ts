import { Component } from '@angular/core';
import { RecipeImages } from "../recipe-images/recipe-images";
import { InfoRecipe } from "../info-recipe/info-recipe";
import { UserIcon } from "../../core/user-icon/user-icon";

@Component({
  selector: 'bra-recipe',
  imports: [RecipeImages, InfoRecipe, UserIcon],
  templateUrl: './recipe.html',
  styleUrl: './recipe.scss'
})
export class Recipe {


}
