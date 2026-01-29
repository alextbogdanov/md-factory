I want to build a CLAUDE.md file generation website. Here's my problem: For    
  each new project that I start I have to create a CLAUDE.md. I generally end up reusing the    
  .md files from other projects but they differ depending on the tech stack. I end up copying   
  and pasting and gluing things together. My vision: I need to be able to manage all my rules.  
  Each rule should have multiples tags (e.g. React, React Native, Node.js, etc). I must be      
  able to create / delete / edit tags. When it's time to create a new .md file, I just go on    
  the landing page, press "Create new .md" and then I can search for all the different rules    
  that I have and press "+" to each rule that I want to add. I must be able to search for the   
  rules based on words inside the rule, their title and tags. Also I must be able to import a   
  claude.md from a previous project that I've created. Each rule should have a title and a      
  body. I must be able to create / edit / delete rules. For each rule I want to see which       
  project uses it. I also want to be able to view all my rules, group / filter them by tags     
  and search by words in their title and body. This means that we'll need vector search or      
  something else (maybe convex full text search: https://docs.convex.dev/search/text-search).   
  I don't want any authentication since this will be an internal project. Use convex for the    
  database. Design the website to look modern, yet simple. It should have a sidebar with all    
  the different sections and tools. I want it to be as simple as possible but yet still feel    
  good with animations and a modern design.    