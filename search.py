
import datetime
import pandas as pd

from pybliometrics.scopus import AbstractRetrieval
from pybliometrics.scopus import AuthorRetrieval

df = pd.DataFrame(columns=['year','owner','title','abstract','keywords','source','type','doi','eid','bibtex','html'])

authors ={
"Carmine Spagnuolo" : '55757507300',
"Gennaro Cordasco" : '57193482076',
"Vittorio Scarano" : '7004638056',
"Delfina Malandrino" : '7801383595',
"Biagio Cosenza" : '26029283100'}
p_index = 0
for author in authors:
    sauthor = AuthorRetrieval(authors[author])
    documents = sauthor.get_documents()
    print("Author: ",author," - ",len(documents)," documents")
    for doc in documents:
        bib = AbstractRetrieval(doc.eid, view="FULL")
        bibtex = ''
        if(bib != None and bib.aggregationType == 'Journal'):
             bibtex = bib.get_bibtex()
        df.loc[p_index] = [doc.coverDate, author, doc.title, doc.description, doc.authkeywords,doc.publicationName,bib.aggregationType, 'https://www.doi.org/'+str(doc.doi), doc.eid, bibtex,bib.get_html()]
        p_index+=1

df = df.sort_values(by=['year'],ascending=False)
df = df.drop_duplicates(subset=['eid'], keep='first')
file_name  = datetime.datetime.now().strftime('publications') 
df.to_csv('data/'+file_name+'.csv',index=False)
df.to_json('data/'+file_name+'.json',orient='split', index=False)
