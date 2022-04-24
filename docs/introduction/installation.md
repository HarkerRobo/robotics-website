# Installation

In order to start coding, you'll need to the right apps to allow you to write robot code. The software can be divided into two groups: those needed to write and deploy code, and those needed to enable and run the robot. Since all the programs needed to run the code are already installed on the software laptop, you only need to install the ones for coding. These include:

-   Visual Studio Code, an IDE for writing code
-   Java JDK 11, to compile the project
-   Gradle, a program to build and deploy code
-   VS Code extentions, to streamline development
-   Git, to manage our code over time
-   WPILib, a library that interfaces with the robot

Fortunately, almost all of these are included with an installer that WPILib provides, which installs a custom version of VS Code (which will be separate from an existing version of VS Code). Follow the following link to go through the installation process: <https://docs.wpilib.org/en/stable/docs/zero-to-robot/step-2/wpilib-setup.html>

Make sure to select **Download VS Code for Single Install** as the installation option. You can leave all the installation options checked, technically our team doesn't use C++ or the Tools and Utilities, but its still nice to have them available.

Once the installation process finishes, first check the name of the VS Code application that it created. If it has the name "Visual Studio Code," I recommend you rename it to something like FRC VS Code 2021 (or the correct year), so you can keep track of multiple versions over time and avoid conflicts with the actual non-WPILib VS Code. Also, you'll have to install Live Share, an extension that isn't included in the installer. Open VS Code and click on the bottom most icon on the left side (looks 3 squares with 1 more detached), then search for "Live Share" and install the one by Microsoft. Live Share is essentially Google Docs for coding and makes collaboration very easy.
