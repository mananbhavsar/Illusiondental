import { NgModule } from '@angular/core';
import { KeysPipe } from './../pipes/keys/keys';
import { FilterPipe } from './filter/filter';
import { HighlightPipe } from './highlight/highlight';
import { ObjectFilterPipe } from './object-filter/object-filter';
import { SafePipe } from './safe/safe';
import { SearchPipe } from './search/search';
@NgModule({
	declarations: [
		KeysPipe,
		FilterPipe,
		ObjectFilterPipe,
		SearchPipe,
		HighlightPipe,
		SafePipe,
		SafePipe
	],
	imports: [],
	exports: [
		KeysPipe,
		FilterPipe,
		ObjectFilterPipe,
		SearchPipe,
		HighlightPipe,
		SafePipe,
		SafePipe
	]
})
export class PipesModule { }
