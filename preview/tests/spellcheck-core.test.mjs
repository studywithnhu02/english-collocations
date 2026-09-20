import assert from 'node:assert/strict';
import {languageForField,tokenize,shouldIgnoreWord,normalizeSuggestions,findSpellingErrors,findSearchIntervals,decorateHtml} from '../spellcheck-core.mjs';

assert.equal(languageForField('c'),'en');
assert.equal(languageForField('m'),'vi');
assert.equal(languageForField('e'),'en');
assert.equal(languageForField('em'),'vi');
assert.deepEqual(tokenize('We need to complet the deadline.'),[
  {word:'We',start:0,end:2},{word:'need',start:3,end:7},{word:'to',start:8,end:10},
  {word:'complet',start:11,end:18},{word:'the',start:19,end:22},{word:'deadline',start:23,end:31}
]);
assert.equal(shouldIgnoreWord('Figma',{lang:'en'}),true);
assert.equal(shouldIgnoreWord('UX',{lang:'en'}),true);
assert.equal(shouldIgnoreWord('2026',{lang:'en'}),true);
assert.equal(shouldIgnoreWord('a',{lang:'en'}),true);
assert.equal(shouldIgnoreWord('complet',{lang:'en'}),false);
assert.deepEqual(normalizeSuggestions('Complet',['complete','completed','complete']),['Complete','Completed']);
const fakeSpell={
  correct(word){return word.toLowerCase()!=='complet'&&word.toLowerCase()!=='chinh';},
  suggest(word){return word.toLowerCase()==='complet'?['complete']:['chính','chinh'];}
};
const enErrors=findSpellingErrors('We need to complet the deadline.',fakeSpell,{lang:'en'});
assert.equal(enErrors.length,1);
assert.equal(enErrors[0].word,'complet');
assert.deepEqual(enErrors[0].suggestions,['complete']);
const viErrors=findSpellingErrors('Đây là một chinh tả.',fakeSpell,{lang:'vi'});
assert.equal(viErrors.length,1);
assert.equal(viErrors[0].word,'chinh');
assert.deepEqual(viErrors[0].suggestions,['chính']);
assert.deepEqual(findSearchIntervals('We need to complet the deadline.','complet'),[{start:11,end:18}]);
const html=decorateHtml('We need to complet the deadline.',enErrors,'deadline');
assert.match(html,/class="spell-error"/);
assert.match(html,/data-spell-index="0"/);
assert.match(html,/class="spell-search-hit"/);
console.log('Spellcheck core tests: PASS');
