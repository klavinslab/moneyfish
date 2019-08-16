# Moneyfish

## Installation

    git clone https://github.com/klavinslab/moneyfish.git
    cd moneyfish
    npm install

## Usage

    node moneyfish month year username password aquarium_url

Both month and year should be numerical (e.g. 5 and 2019 for May 2019). 

## Building binares

    npm i pkg -g
    pkg .

## Using the Windows binary

1. Go to 
    ```
    https://github.com/klavinslab/moneyfish
    ```
2. Click
    ```
    moneyfish-win.exe
    ```
    and then click "Download"
3. Make a directory called `aquarium` on your desktop and move the downloaded file there.
4. Open a command window by typing `cmd` into the Windows search (lower left).
5. Change into the directory you just made by typing something like
    ```
    cd Desktop\aquarium
    ```
6. Type the command
    ```
    moneyfish-win.exe 7 2019 yourusername yourpassword http://52.27.43.242
    ```
    where you put your Aquarium username and password in. Change 7 to the desired month (1-12) and 2019 to the desired year.
7. The resulting spreadsheet will be created in the same directory and
you can open it in Excel. 
