function printDocument(kind='flashcards'){document.body.dataset.printTemplate=kind;document.body.classList.add('print-mode');window.setTimeout(()=>{window.print();window.setTimeout(()=>{document.body.classList.remove('print-mode');delete document.body.dataset.printTemplate},300)},30)}
window.PreviewPrint={flashcards:()=>printDocument('flashcards'),worksheet:()=>printDocument('worksheet')};
