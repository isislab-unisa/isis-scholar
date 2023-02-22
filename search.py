from pybliometrics.scopus import AbstractRetrieval
from pybliometrics.scopus import AuthorRetrieval
import datetime
import pandas as pd

def generate_html(dataframe: pd.DataFrame):
    # get the table HTML from the dataframe
    table_html = dataframe.to_html(table_id="ptable",classes="table table-striped table-bordered wrap")
    # construct the complete HTML with jQuery Data tables
    # You can disable paging or enable y scrolling on lines 20 and 21 respectively
    html =f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="ie=edge">
        <title>Document</title>
        <link
            rel="stylesheet"
            href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css"                         
        />
        <link
            rel="stylesheet"
            href="https://cdn.datatables.net/1.10.19/css/dataTables.bootstrap4.min.css"
        />
        <link
            rel="stylesheet"
            href="https://cdn.datatables.net/responsive/2.2.3/css/responsive.bootstrap4.min.css"
        />
        <link
            rel="stylesheet"
            href="https://cdn.datatables.net/select/1.3.0/css/select.dataTables.min.css"
        />
    </head>
    <body class="p-3">
        {table_html}
        <script src="https://code.jquery.com/jquery-3.3.1.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.3/umd/popper.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.1.3/js/bootstrap.min.js"></script>
        <script src="https://cdn.datatables.net/1.10.19/js/jquery.dataTables.min.js"></script>
        <script src="https://cdn.datatables.net/1.10.19/js/dataTables.bootstrap4.min.js"></script>
        <script src="https://cdn.datatables.net/responsive/2.2.3/js/dataTables.responsive.min.js"></script>
        <script src="https://cdn.datatables.net/responsive/2.2.3/js/responsive.bootstrap4.min.js"></script>
        <script src="https://cdn.datatables.net/select/1.3.0/js/dataTables.select.min.js"></script>
        <script>
        $(document).ready(function() {{
            $('#ptable').DataTable({{
                order: [[1, 'desc']],
                paging: true,

            responsive: {{
                details: {{
                display: $.fn.dataTable.Responsive.display.modal({{
                    header: function(row) {{
                    var data = row.data();
                    return 'Details for ' + data[0] + ' ' + data[1];
                    }}
                }}),
                renderer: $.fn.dataTable.Responsive.renderer.tableAll({{
                    tableClass: 'table'
                }})
                }}
            }}
            }});
        }});
        </script>
    </body>
    </html>
    """
    # html = f"""
    # <html>
    # <header>
    #     <link href="https://cdn.datatables.net/1.11.5/css/jquery.dataTables.min.css" rel="stylesheet">
    # </header>
    
    # <body>
    # {table_html}
    # <script src="https://code.jquery.com/jquery-3.6.0.slim.min.js" integrity="sha256-u7e5khyithlIdTpu22PHhENmPcRdFiHRjhAuHcs05RI=" crossorigin="anonymous"></script>
    # <script type="text/javascript" src="https://cdn.datatables.net/1.11.5/js/jquery.dataTables.min.js"></script>
    # <script>
    #     $(document).ready( function () {{
    #         $('#table').DataTable({{
    #             paging: true,    
    #             // scrollY: 400,
    #             order: [[1, 'desc']],
    #         }});
    #     }});
    # </script>
    # </body>
    # </html>
    # """
    return html

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
        
        # if(bib != None and bib.aggregationType == 'Journal'):
        #     print(bib.get_bibtex())

df = df.sort_values(by=['year'],ascending=False)
df = df.drop_duplicates(subset=['eid'], keep='first')
file_name  = datetime.datetime.now().strftime('publications') 
df.to_csv('data/'+file_name+'.csv',index=False)
df.to_json('data/'+file_name+'.json',orient='split', index=False)
html = generate_html(df)
open("index.html", "w").write(html)
