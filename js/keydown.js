//TODO: This is so horrible to read, should make a nicer abstractions for input handling. But all input handling libs I've found have been lacking.

//TODO: some of these probably belong in app menus and need to be listened to by ipcRenderer.on('whatever', e=>{})

function keydown(e) {
  console.log(e.key, e.code)
  //mod returns modifier keys in exclusive form, so you don't need to do e.shiftKey && !e.altKey && !e.ctrlKey && !e.metaKey, just check if only shiftKey is pressed
  let mod = modkeys(e)

  //Selection
  if (scope === '') {
    if (mod.none && e.key === 'ArrowUp') {
      selRow(e, 'up')
      return
    }
    else if (mod.none && e.key === 'ArrowDown') {
      selRow(e, 'down')
      return
    }
    else if (mod.none && e.key === 'ArrowLeft') {
      selCol(e, 'left')
      return
    }
    else if (mod.none && e.key === 'ArrowRight') {
      selCol(e,'right')
      return
    }
    /*TODO: additive selection via shift+arrow keys
      - shift+up/down should select just rows, props don't line up, so selecting up/down as props only wouldn't make much sense
    */
    else if (mod.shift && e.key === 'ArrowUp') {
      selRow(e, 'up:add')
      return
    }
    else if (mod.shift && e.key === 'ArrowDown') {
      selRow(e, 'down:add')
      return
    }
    else if (mod.shift && e.key === 'ArrowLeft') {
      selCol(e, 'left:add')
      return
    }
    else if (mod.shift && e.key === 'ArrowRight') {
      selCol(e,'right:add')
      return
    }
    else if (mod.cmd && e.key === 'a') {
      selAll(e)
      return
    }
    else if (mod.cmd && e.key === 'd') {
      selSimilar(e)
      return
    }
    else if (mod.none && e.key === 'Escape') {
      selEscape(e)
      return
    }
    else if (mod.none && e.key === '-') {
      fold(e, ':fold')
      return
    }
    else if (mod.none && e.key === '+') {
      fold(e, ':unfold')
      return
    }
  }

  //Creating stuff
  if (scope === '') {
    if (mod.none && e.key.match(/^[a-z]$/)) {
      createRow(e, ':tag')
      return
    }
    else if ((mod.none || mod.shift) && e.key.match(/^[A-Z]$/)) {
      createRow(e, ':txt')
      return
    }
    else if (mod.shift && e.key === 'Enter') {
      createRow(e, ':txt')
      return
    }
    else if (mod.cmd && e.key === 'Enter') {
      createRow(e, ':tag', 'div')
      return
    }
    else if (mod.none && e.key === ' ') {
      createProp(e)
      return
    }
    else if (e.key === ',') {
      createProp(e, ':prop')
      return
    }
    else if (e.key === ':' || e.key === '=') {
      createProp(e, ':val')
      return
    }
    else if (e.key === '#') {
      createProp(e, ':id')
      return
    }
    else if (e.key === '.') {
      createProp(e, ':class')
      return
    }
  }

  //Edit actions while in root scope
  if (scope === '') {
    if (mod.none && e.key === 'Enter') {
      history.update()
      startEdit(e)
      return
    }
    else if (mod.none && e.key === 'Backspace') {
      del(e, ':backward')
      return
    }
    else if (mod.none && e.key === 'Delete') {
      del(e, ':forward')
      return
    }
    else if (mod.cmdShift && e.code === 'KeyD') { //Use KeyD so there's no confusion because of shift modifying the letter that's output
      duplicate(e)
      return
    }
    else if (mod.none && e.key === 'Tab') {
      tab(e, 1)
      return
    }
    else if (mod.shift && e.key === 'Tab') {
      tab(e, -1)
      return
    }
    else if (e.metaKey && e.key === '/') { //Check for emetakey instead of mod function because / could come through modifiers on some key layouts, like Scandinavian ones for example.
      comment(e)
      return
    }
    else if (mod.ctrl && e.key === 'ArrowUp') {
      moveUp(e)
      return
    }
    else if (mod.ctrl && e.key === 'ArrowDown') {
      moveDown(e)
      return
    }
    else if (mod.ctrl && e.key === 'ArrowLeft') {
      moveLeft(e)
      return
    }
    else if (mod.ctrl && e.key === 'ArrowRight') {
      moveRight(e)
      return
    }
  }

  //Edit actions while editing an item
  if (scope === 'editing') {
    let target = $('[contenteditable="true"]')

    if (mod.none && e.key === 'Enter' || e.key === 'Escape') {
      console.log('commit edit')
      commitEdit(e)
      return
    }
    else if (mod.none && e.key === 'Backspace' || e.key === 'Delete') {
      autofill.prevent()
      return
    }
    else if (mod.none && e.key === 'Tab') {
      commitEdit()
      //Pressing tab to indent while editing felt way too fiddly, fought with muscle memory, so pressing tab is like autocompletion in the terminal or text editor, it just accepts whatever's in the input box.
      return
    }
    else if (mod.shift && e.key === 'Tab') {
      commitEdit()
      return
    }
    //Make new props when pressing keys that make sense. Like, you'd expect that if you type `div `, that stuff after that would be an attribute name, so that's what happens. This becomes troublesome when the visualised syntax clashes with html validity. HTML allows : * and stuff in attribute names. Pressing : inside an attribute name must allow you to keep typing, because svg is a common case where you use some namespacing.
    else if (target[0].tagName === 'TAG' && e.code === 'Space') {
      commitEdit()
      createProp(e)
    } else if (target[0].tagName === 'PROP' && e.code === 'Space') {
      commitEdit()
      createProp(e)
    }
  }

  //Drag & drop
  if (scope === 'dragging') {
    if (e.key === 'Escape') {
      cancelDrag(e)
      return
    }
  }
}
