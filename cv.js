//let {pages, inbox, select, taskOrder, taskFiles, globalTaskFilter, dailyNoteFolder, dailyNoteFormat, done, sort, css, forward, dateFormat, options} = input;
let {view, fold} = input;

switch(view){
	case "tasks":
		t = tasks(fold);
		dv.paragraph(t);
		break;
	case "callout":
		let {title, text, type} = input;
		c = callout(title, text, type, fold);
		dv.paragraph(c);
		break;
	case "dailyLinks":
		dl = dailyLinks();
		dv.paragraph(dl);
		break;
	case "mentions":
		m = mentions();
		dv.paragraph(m);
		break;
	case "relatedContent":
		rc = relatedContent();
		dv.paragraph(rc);
		break;
	default:
		dv.paragraph("not a valid view name!");
}

function dailyLinks(){
	let strDate = moment(dv.current().title).format("YYYY-MM-DD")	
	let folder = dv.current().file.folder;
	let mon = moment(strDate, "YYYY-MM-DD").weekday(0).format("YYYY-MM-DD");
	let tue = moment(strDate, "YYYY-MM-DD").weekday(1).format("YYYY-MM-DD");
	let wed = moment(strDate, "YYYY-MM-DD").weekday(2).format("YYYY-MM-DD");
	let thu = moment(strDate, "YYYY-MM-DD").weekday(3).format("YYYY-MM-DD");
	let fri = moment(strDate, "YYYY-MM-DD").weekday(4).format("YYYY-MM-DD");
	let sat = moment(strDate, "YYYY-MM-DD").weekday(5).format("YYYY-MM-DD");
	let sun = moment(strDate, "YYYY-MM-DD").weekday(6).format("YYYY-MM-DD");
	var strLinks = createDayLink(mon,"Mon",strDate) + " - " +
	  createDayLink(tue,"Tue",strDate) + " - " +
	  createDayLink(wed,"Wed",strDate)+ " - " +
	  createDayLink(thu,"Thu",strDate)+ " - " +
	  createDayLink(fri,"Fri",strDate);
	return '### ' + strLinks;		
	
}

function createDayLink(date, day, refdate){
	let path = dv.current().file.folder + "/" + date;
	if(date != refdate)
		return dv.fileLink(path,false,day);
	else
		return day;
}

function tasks(fold){
	let todoCount = dv.pages().file.tasks.where(t => !t.checked && !t.overdue && t.text.includes(dv.current().file.name)).length;
	let completedCount = dv.pages().file.tasks.where(t => t.checked  && t.text.includes(dv.current().file.name)).length;
	let overdueCount = dv.pages().file.tasks.where(t => t.checked && t.overdue && t.text.includes(dv.current().file.name)).length;
	let tasks = dv.pages().file.tasks.where(t =>  t.text.includes(dv.current().file.name));

	let todo_query = `
	not done
	description includes ${dv.current().file.name}
	path does not include System
	`;
	
	let done_query = `
	(description includes ${dv.current().file.name}) AND (status.type is DONE)
	path does not include System
	`;
	
	
	let txt = callout('Todo', '```tasks\n' + todo_query + '\n```', 'todo',"+");
	txt += '\n';
	txt += callout('Completed', '```tasks\n' + done_query + '\n```', 'completed',"-");
	return callout('Task' + `\n` , txt, 'todo',fold);
	
}



function callout(title, text, type, fold) {
    let allText = `> [!${type}]${fold} ` + title +`\n` + text;
	console.log(allText);
    let lines = allText.split('\n');
    return lines.join('\n> ') + '\n'
}

function mentions(){
	let q = `
	LIST WITHOUT ID
	link(L.link,":luc_arrow_right_circle: ") + " " +  L.text 
	FROM [[]]
	FLATTEN file.lists AS L
	WHERE contains(L.outlinks, [[]]) AND !L.task AND meta(L.header).subpath != "Modified Today"  AND !contains(topic ,[[]])
	`;
	return q;
}

function topicNotes(){
	let q = `
	LIST WITHOUT ID
	link(file.link,":luc_clipboard_list:") + " " + summary + " "
	FROM [[]] AND !"!" AND !"System"
	WHERE contains(topic ,[[]]) AND type != "meeting"
	`;
	
	return q; 
}

// Related mentions and notes in a single callout
function relatedContent(){
	let m = mentions();
	let t = topicNotes();
	return callout('Related','Notes \n ```dataview \n' + t + '\n``` \n' + 'Mentions \n ```dataview \n' + m + '\n``` \n', 'note',"+");
	
}