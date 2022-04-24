# Git

Git is a source control tool that we use to manage changes in our code. It allows us to map out the progress of our code over time, and also makes it easy to revert to a previous version if necessary. At its core, Git works not by storing the code but instead by tracking _commits_, which is a change in the code. Whenever make a major change or implement an important feature, we create a commit, which stores how the code was changed from the previous commit. To fetch the latest version, it runs through the previous commits and reconstructs the code. To speed things up, git creates checkpoints that reocrds the codebase at that commit, so it doesn't have to jump all the way back to the start.

To store our code online we use GitHub. GitHub stores Git projects online, and is referred to as a _remote_, a server where your project is stored (think of Git as email, while GitHub is Gmail).

### Tutorials

There are tons of Git tutorials online that are really great. To learn the basics, go to <https://backlog.com/git-tutorial/what-is-git/> and complete the **Learn Git Basics** section (except the _Rewriting History_ lesson, that is very bad practice) and the **Learn Git Collboration** section, stopping after you complete the _Branching Workflows_ lesson. Keep in mind that the sample workflow in that lesson is typical in larger scopes, our team normally onlt uses two branches, dev and master.

Git is very complex and it can be difficult to remember all the commands. Our team has a cheatsheet available at <https://robotics.harker.org/github> that contains all the commands you should need in robotics that you can consult if you forget something.

### Commit Messages

Commit messages summarize a group of changes into a sentence, so writing them well makes the development process much easier. Our team has a standard format for commit messages: they should start with a capitalized, present tense verb. A valid commit message forms a sentence if you put "This commit will ..." before it (ignoring capitalization).

> This commit will **Begin tuning auton paths**.

Multiple phrases should be separated by a comma (without _and_), which does break this structure, but the individual parts should still follow it. Here is a sample set of commits from our 2020 codebase:

![image of commits](https://i.imgur.com/ZhsBEtP.png)
