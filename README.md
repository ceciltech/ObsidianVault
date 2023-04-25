# Usage
To add a related content note to a target note add two dataview fields to the content note:

Topic:: [[Target Page]]

Summary:: Brief description of note

````
  ```dataviewjs
    await dv.view("cv",{view:"relatedContent", fold:"+"})
  ```
````
