Процесс установки приложения

```bash
https://github.com/Zireael112/react-diploma-unchecked.git

cd backend

python -m venv venv 

source venv/Scripts/activate

pip install -r requirements.txt

```
В backend/config/base.py в писать свои данные от базы данных 

```bash
python manage.py makemigrations

python manage.py migrate
```


> frontend section

```bash
cd ../frontend/

npm install

npm run build

cd ../backend/

python manage.py runserver
```
Запускать на localhost:8000

