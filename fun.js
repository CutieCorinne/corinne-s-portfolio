(() => {
	const icons = document.querySelectorAll('.desktop-icon');
	const desktop = document.getElementById('desktop');
	const tray = document.getElementById('tray');
	const clockEl = document.getElementById('clock');
	let z = 100;

	function updateClock(){
		const now = new Date();
		const hh = String(now.getHours()).padStart(2,'0');
		const mm = String(now.getMinutes()).padStart(2,'0');
		clockEl.textContent = `${hh}:${mm}`;
	}
	updateClock();
	setInterval(updateClock, 30_000);

	function createWindow(app){
		const tpl = document.getElementById('tpl-' + app);
		if(!tpl) return null;
		const node = tpl.content.firstElementChild.cloneNode(true);
		node.style.zIndex = ++z;

		node.style.top = (80 + Math.random()*40) + 'px';
		node.style.left = (80 + Math.random()*40) + 'px';

		attachWindowBehavior(node);
		desktop.appendChild(node);
		return node;
	}

	function attachWindowBehavior(win){
		const title = win.querySelector('.titlebar');
		const closeBtn = win.querySelector('.close');
		const minBtn = win.querySelector('.minimize');
		const app = win.dataset.app;

		let isDragging = false, startX=0, startY=0, origX=0, origY=0;
		title.addEventListener('pointerdown', (e) => {
			if (e.target.closest && e.target.closest('.controls')) return;
			isDragging = true; title.setPointerCapture(e.pointerId);
			startX = e.clientX; startY = e.clientY;
			origX = parseInt(win.style.left || win.getBoundingClientRect().left,10);
			origY = parseInt(win.style.top || win.getBoundingClientRect().top,10);
			win.style.transition = 'none';
			bringToFront(win);
		});
		title.addEventListener('pointermove', (e) => {
			if(!isDragging) return;
			const dx = e.clientX - startX; const dy = e.clientY - startY;
			win.style.left = (origX + dx) + 'px';
			win.style.top = (origY + dy) + 'px';
		});
		title.addEventListener('pointerup', (e) => { isDragging=false; win.style.transition=''; });
		title.addEventListener('pointercancel', () => { isDragging=false; win.style.transition=''; });

		win.addEventListener('mousedown', () => bringToFront(win));

		closeBtn.addEventListener('click', () => {
			const btn = tray.querySelector(`[data-app="${app}"]`);
			btn && btn.remove();
			win.remove();
		});

		minBtn.addEventListener('click', () => {
			win.style.display = 'none';
		});

		const taskBtn = document.createElement('button');
		taskBtn.className = 'task-btn active';
		taskBtn.textContent = capitalize(app);
		taskBtn.dataset.app = app;
		taskBtn.addEventListener('click', () => {
			if(win.style.display === 'none'){
				win.style.display = '';
				bringToFront(win);
				taskBtn.classList.add('active');
			} else {
				win.style.display = 'none';
				taskBtn.classList.remove('active');
			}
		});
		tray.appendChild(taskBtn);
	}

	function bringToFront(win){
		win.style.zIndex = ++z;
		const app = win.dataset.app;
		const buttons = tray.querySelectorAll('.task-btn');
		buttons.forEach(b=> b.classList.toggle('active', b.dataset.app === app));
	}

	function capitalize(s){return s.charAt(0).toUpperCase() + s.slice(1)}

	icons.forEach(btn => {
		btn.addEventListener('click', () => {
			const app = btn.dataset.app;
			const existing = document.querySelector(`.window[data-app="${app}"]`);
			if (existing) {
				if (existing.style.display !== 'none') {
					const btnTask = tray.querySelector(`[data-app="${app}"]`);
					btnTask && btnTask.remove();
					existing.remove();
				} else {
					existing.style.display = '';
					bringToFront(existing);
				}
				return;
			}
			const w = createWindow(app);
			if (w) bringToFront(w);
		});
	});

	const obs = new MutationObserver(()=>{
	});
	obs.observe(desktop, {childList:true, subtree:true});

	document.addEventListener('keydown', (e)=>{
		if(e.key==='Escape'){
			const wins = Array.from(document.querySelectorAll('.window'));
			if(wins.length) wins[wins.length-1].remove();
		}
	});

	window.createWindow = createWindow;

})();

