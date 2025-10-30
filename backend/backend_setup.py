import duckdb

def duck_setup():
    conn = duckdb.connect()
    conn.execute("INSTALL httpfs")
    conn.close()
    print("DuckDB extensions installed successfully")

def main():
    duck_setup()

if __name__=='__main__':
    main()
