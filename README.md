I'm sure if yall went and looked through the `style.css` yall might have realized that i made the caret transparent. I made set it that way because it would drift behind the words that are on the screen and ruin the illusion... basically. BUT I made a custom caret or visual anchor that is at line 113:

```css
.char.current { outline: 2px dashed rgba(100, 116, 139, 0.12); }
```

but it is just a static dashed outline it doesnt blink or anything flashy. if you would like to change that i will put 2 new blocks that you can put there instead if you would want to change it.

this will act as just a normal text cursor (SUPER LAME)

```css
.char.current {
  position: relative; 
}
.char.current::before { 
  content: ""; 
  position: absolute; 
  left: 0; 
  top: 15%; 
  height: 70%; 
  width: 2px; 
  background-color: var(--accent); 
  animation: blink 1s infinite; 
}
@keyframes blink { 
  50% { opacity: 0; } 
}
```

just replace what is on line 113 with that.

this one will give vibes of a retro or vintage terminal cursor (SUPER COOL) 

```css
.char.current { 
  background-color: rgba(100, 116, 139, 0.2); 
  border-radius: 3px; 
  animation: pulse-bg 1.2s infinite ease-in-out; 
}
@keyframes pulse-bg { 
  0%, 100% { background-color: rgba(100, 116, 139, 0.3); } 
  50% { background-color: rgba(100, 116, 139, 0.05); } 
}
```

And that is about it as of right now.

Let me know if there is any issues that yall would like fixed or something else that yall want added!!
